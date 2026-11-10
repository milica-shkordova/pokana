import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ApiError,
  type EventDetail,
  type MediaItem,
  type MediaKind,
  type MediaLibrary,
  type PublicEvent,
  type ResolvedMedia,
  type Rsvp,
  type SectionState,
} from "@momentelo/shared";
import { getDefinition, getPublishChecklist, resolveSections } from "@momentelo/templates/definitions";
import { Alert, Button, ButtonLink, Dialog, EventStatusBadge, Segmented, Switch, useToast } from "@momentelo/ui";
import { AuthGate } from "@/components/AdminLayout";
import LoadState from "@/components/LoadState";
import { MediaPicker } from "@/components/MediaPicker";
import { IconBack, IconDesktop, IconDown, IconPhone, IconUp } from "@/components/Icons";
import { useEventEditor } from "@/components/editor/useEventEditor";
import SectionNav, { type Pane } from "@/components/editor/SectionNav";
import BasicsForm, { ClientForm } from "@/components/editor/BasicsForm";
import { EditorCardSlot } from "@/components/editor/fields";
import PhotosForm from "@/components/editor/PhotosForm";
import ThemeForm from "@/components/editor/ThemeForm";
import RepliesPanel from "@/components/editor/RepliesPanel";
import { SectionForm } from "@/components/editor/SectionForms";
import LivePreview from "@/components/editor/LivePreview";
import type { FormProps } from "@/components/editor/context";
import { api, copyText, errorMessage, useResource } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useSession } from "@/lib/session";
import { useScrollSpy } from "@/lib/useScrollSpy";

const toResolved = (m: MediaItem): ResolvedMedia => ({
  id: m.id,
  kind: m.kind,
  url: m.url,
  srcSet: m.srcSet,
  width: m.width,
  height: m.height,
  focalX: m.focalX,
  focalY: m.focalY,
  alt: m.alt,
  durationSec: m.durationSec,
});

export default function EventEditorPage() {
  const router = useRouter();
  const toast = useToast();
  const { refreshStats } = useSession();
  const id = router.isReady ? String(router.query.id) : null;
  const editor = useEventEditor(id);
  const { draft, update, updateContent, save, applyServer } = editor;
  const def = draft ? getDefinition(draft.templateId) : undefined;

  // All panes are stacked in one column: the sidebar scrolls to a card, and
  // the highlighted item follows whichever card is in view (the last ones
  // too, once the page is scrolled to the bottom).
  const hasDraft = !!editor.draft;
  const [activePane, selectPane] = useScrollSpy(".admin-editor__pane", {
    enabled: hasDraft,
    offset: 160,
    deps: JSON.stringify(editor.draft?.sections ?? null),
  });
  const pane = ((activePane || "pane-basics").replace(/^pane-/, "") as Pane);
  const goToPane = useCallback(
    (p: Pane) => {
      selectPane(`pane-${p}`);
      document.getElementById(`pane-${p}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [selectPane],
  );
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<unknown>(null);
  const [sharing, setSharing] = useState(false);
  const [, tick] = useState(0);

  // "Saved 2 min ago" stays fresh.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  // Media library (for thumbnails, pickers and the preview's media map).
  const lib = useResource<MediaLibrary>(id ? "/api/admin/media" : null);
  const library = useMemo(() => lib.data?.items ?? [], [lib.data]);
  const addToLibrary = useCallback(
    (items: MediaItem[]) => lib.mutate((prev) => ({ storage: prev?.storage ?? { usedBytes: 0, quotaBytes: 1 }, items: [...items, ...(prev?.items ?? [])] })),
    [lib],
  );
  const mediaById = useCallback((mid: string | null | undefined) => (mid ? library.find((m) => m.id === mid) : undefined), [library]);

  const rsvps = useResource<Rsvp[]>(id ? `/api/admin/events/${id}/rsvps` : null);

  const [picker, setPicker] = useState<{ kind: MediaKind; onPick: (m: MediaItem) => void; title?: string } | null>(null);
  const pick = useCallback((kind: MediaKind, onPick: (m: MediaItem) => void, title?: string) => setPicker({ kind, onPick, title }), []);

  const sections: SectionState[] = useMemo(() => (draft && def ? resolveSections(def, draft.sections) : []), [draft, def]);
  const checklist = useMemo(
    () =>
      draft && def
        ? getPublishChecklist(
            {
              name: draft.name,
              eventDate: draft.eventDate,
              languages: draft.languages,
              content: draft.content,
              sections,
              rsvpEmails: draft.rsvpEmails,
              rsvpTestedAt: draft.rsvpTestedAt,
              rsvpDeadline: draft.rsvpDeadline,
              clientApproved: draft.clientApproved,
            },
            def,
          )
        : [],
    [draft, def, sections],
  );
  const ready = checklist.every((c) => c.ok);

  // The event as the public site will render it — pushed into the preview iframe.
  const previewEvent: PublicEvent | null = useMemo(() => {
    if (!draft) return null;
    const ids = new Set<string>([
      ...(Object.values(draft.content.photos ?? {}).filter(Boolean) as string[]),
      ...(draft.content.gallery?.photos ?? []),
      ...((draft.content.people?.items ?? []).map((p) => p.photo).filter(Boolean) as string[]),
      ...(draft.content.music?.mediaId ? [draft.content.music.mediaId] : []),
    ]);
    const media = Object.fromEntries(library.filter((m) => ids.has(m.id)).map((m) => [m.id, toResolved(m)]));
    return {
      id: draft.id,
      slug: draft.slug,
      templateId: draft.templateId,
      name: draft.name,
      eventDate: draft.eventDate,
      languages: draft.languages,
      content: draft.content,
      theme: draft.theme,
      sections,
      rsvpDeadline: draft.rsvpDeadline,
      rsvpOpen: true,
      media,
      noindex: draft.noindex,
      isDemo: draft.isDemo,
      preview: true,
    };
  }, [draft, library, sections]);

  const publish = async () => {
    if (!draft) return;
    setPublishing(true);
    setPublishError(null);
    try {
      await save();
      const res = await api.post<EventDetail>(`/api/admin/events/${draft.id}/${draft.status === "live" ? "unpublish" : "publish"}`);
      applyServer(res);
      toast(res.status === "live" || res.status === "past" ? "Published — the link is live" : "Unpublished");
      refreshStats();
    } catch (err) {
      setPublishError(err);
    } finally {
      setPublishing(false);
    }
  };

  const share = async () => {
    if (!draft) return;
    setSharing(true);
    try {
      await save();
      const { url } = await api.post<{ url: string }>(`/api/admin/events/${draft.id}/preview-link?review=1`);
      const copied = await copyText(url);
      if (draft.status === "draft") applyServer(await api.get<EventDetail>(`/api/admin/events/${draft.id}`));
      toast(copied ? "Preview link copied — send it to the client for approval" : url);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setSharing(false);
    }
  };

  const saveLabel =
    editor.saveState === "saving"
      ? "Saving…"
      : editor.saveState === "dirty"
        ? "Unsaved changes"
        : editor.saveState === "error"
          ? "Couldn't save"
          : editor.savedAt
            ? `Saved ${timeAgo(editor.savedAt)}`
            : "";

  const formProps: FormProps | null =
    draft && def ? { event: draft, def, languages: draft.languages, update, updateContent, library, mediaById, addToLibrary, pick } : null;

  return (
    <AuthGate title={draft?.name ?? "Event"}>
      <div className="admin-editor ui-root">
        <LoadState loading={!draft && !editor.loadError} error={editor.loadError ?? undefined}>
          {draft && formProps && def ? (
            <>
              <header className="admin-editor__top">
                <Link href={draft.isDefaults ? "/templates" : "/"} className="admin-editor__back">
                  <IconBack />
                  {draft.isDefaults ? "Templates" : "Events"}
                </Link>
                <span className="admin-editor__divider" aria-hidden />
                <div className="admin-editor__title">
                  <span className="admin-editor__name">{draft.isDefaults ? `${draft.templateName}: defaults` : draft.name}</span>
                  <span className="admin-muted" aria-live="polite">
                    {draft.isDefaults ? `Template defaults · ${def.name} layout` : draft.templateName} · {saveLabel}
                    {editor.saveState === "error" && (
                      <>
                        {" "}
                        <button type="button" className="admin-linkbtn" onClick={() => void save()}>
                          Retry
                        </button>
                      </>
                    )}
                  </span>
                </div>
                {!draft.isDefaults && <EventStatusBadge status={draft.status} />}
                <div className="admin-editor__actions">
                  <Segmented
                    inline
                    label="Preview device"
                    value={device}
                    onChange={setDevice}
                    options={[
                      { value: "phone", label: <IconPhone />, ariaLabel: "Phone preview" },
                      { value: "desktop", label: <IconDesktop />, ariaLabel: "Desktop preview" },
                    ]}
                  />
                  {draft.isDefaults ? (
                    <ButtonLink href="/templates">Done</ButtonLink>
                  ) : (
                    <Button variant="secondary" onClick={share} loading={sharing}>
                      Share preview link
                    </Button>
                  )}
                  {draft.isDefaults ? null : draft.status === "live" ? (
                    <Button variant="secondary" onClick={publish} loading={publishing}>
                      Unpublish
                    </Button>
                  ) : (
                    <Button onClick={publish} loading={publishing} title={ready ? undefined : "Finish the checklist first"}>
                      {draft.status === "past" ? "Republish" : "Publish"}
                    </Button>
                  )}
                </div>
              </header>

              <div className="admin-editor__body">
                <SectionNav
                  event={draft}
                  def={def}
                  sections={sections}
                  pane={pane}
                  onPane={goToPane}
                  onSections={(s) => update({ sections: s })}
                  checklist={checklist}
                  onApproved={(v) => update({ clientApproved: v })}
                  rsvpCount={rsvps.data?.length ?? 0}
                />

                <main className="admin-editor__main" id="main">
                  {editor.saveState === "error" && <Alert tone="danger">Couldn&apos;t save: {errorMessage(editor.saveError)}</Alert>}
                  {draft.isDefaults && (
                    <Alert tone="info">
                      You&apos;re editing the defaults of <strong>{draft.templateName}</strong>. Every new event made from this template starts as a copy of
                      what you set here. Changes save automatically and don&apos;t affect existing events.
                    </Alert>
                  )}
                  <div id="pane-basics" className="admin-editor__pane">
                    <BasicsForm {...formProps} applyServer={applyServer} flush={save} />
                  </div>
                  <div id="pane-photos" className="admin-editor__pane">
                    <PhotosForm {...formProps} />
                  </div>
                  {sections.map((s, i) => {
                    const meta = def.sections.find((d) => d.id === s.id);
                    const setSections = (next: SectionState[]) => update({ sections: next });
                    const moveBy = (d: -1 | 1) => {
                      const next = [...sections];
                      const [moved] = next.splice(i, 1);
                      next.splice(i + d, 0, moved);
                      setSections(next);
                    };
                    const setOn = (on: boolean) => setSections(sections.map((x) => (x.id === s.id ? { ...x, enabled: on } : x)));
                    return (
                      <div key={s.id} id={`pane-${s.id}`} className="admin-editor__pane">
                        <EditorCardSlot.Provider
                          value={{
                            muted: !s.enabled,
                            actions: (
                              <>
                                <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => moveBy(-1)} aria-label={`Move ${meta?.label ?? s.id} up`}>
                                  <IconUp />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={i === sections.length - 1}
                                  onClick={() => moveBy(1)}
                                  aria-label={`Move ${meta?.label ?? s.id} down`}
                                >
                                  <IconDown />
                                </Button>
                                <Switch
                                  checked={s.enabled}
                                  onChange={setOn}
                                  disabled={!!meta?.required}
                                  label={`${meta?.label ?? s.id} ${s.enabled ? "on" : "off"}`}
                                />
                              </>
                            ),
                            notice: !s.enabled ? (
                              <Alert tone="warning">
                                This section is off and won&apos;t show on the invitation.{" "}
                                <button type="button" className="admin-linkbtn" onClick={() => setOn(true)}>
                                  Turn it on
                                </button>
                              </Alert>
                            ) : null,
                          }}
                        >
                          <SectionForm {...formProps} section={s.id} label={meta?.label ?? s.id} />
                        </EditorCardSlot.Provider>
                      </div>
                    );
                  })}
                  <div id="pane-theme" className="admin-editor__pane">
                    <ThemeForm {...formProps} />
                  </div>
                  {!draft.isDefaults && (
                    <>
                      <div id="pane-client" className="admin-editor__pane">
                        <ClientForm {...formProps} />
                      </div>
                      <div id="pane-replies" className="admin-editor__pane">
                        <RepliesPanel event={draft} />
                      </div>
                    </>
                  )}
                </main>

                {previewEvent && <LivePreview eventId={draft.id} event={previewEvent} device={device} />}
              </div>

              <Dialog
                open={!!publishError}
                onClose={() => setPublishError(null)}
                title="Not ready to publish yet"
                footer={<Button onClick={() => setPublishError(null)}>OK</Button>}
              >
                {publishError instanceof ApiError && publishError.issues.length ? (
                  <ul className="admin-issues">
                    {publishError.issues.map((i) => (
                      <li key={i.path}>{i.message}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{errorMessage(publishError)}</p>
                )}
              </Dialog>

              {picker && (
                <MediaPicker
                  open
                  kind={picker.kind}
                  title={picker.title}
                  eventId={draft.id}
                  library={library}
                  onUploaded={addToLibrary}
                  onPick={picker.onPick}
                  onClose={() => setPicker(null)}
                />
              )}
            </>
          ) : draft && !def ? (
            <Alert tone="danger">The template “{draft.templateId}” isn&apos;t available in this build.</Alert>
          ) : null}
        </LoadState>
      </div>
    </AuthGate>
  );
}
