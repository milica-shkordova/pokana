import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import type { Rsvp } from "@pokanito/shared";
import { getDefinition } from "@pokanito/templates/definitions";
import { Alert, LoadState } from "@pokanito/ui";
import { AuthGate } from "@/components/AdminLayout";
import { SAVED_LABEL_TICK_MS } from "@/features/event-editor/constants";
import type { FormProps } from "@/features/event-editor/context";
import EditorHeader from "@/features/event-editor/EditorHeader";
import EditorMain from "@/features/event-editor/EditorMain";
import LivePreview from "@/features/event-editor/LivePreview";
import PublishErrorDialog from "@/features/event-editor/PublishErrorDialog";
import SectionNav from "@/features/event-editor/SectionNav";
import type { Device } from "@/features/event-editor/types";
import { useEditorChecklist } from "@/features/event-editor/useEditorChecklist";
import { useEditorMedia } from "@/features/event-editor/useEditorMedia";
import { useEditorPanes } from "@/features/event-editor/useEditorPanes";
import { useEventEditor } from "@/features/event-editor/useEventEditor";
import { useNow } from "@/features/event-editor/useNow";
import { usePublishActions } from "@/features/event-editor/usePublishActions";
import { buildPreviewEvent, saveLabel } from "@/features/event-editor/utils";
import { MediaPicker } from "@/features/media/MediaPicker";
import { useResource } from "@/lib/api";

export default function EventEditorPage() {
  const router = useRouter();
  const id = router.isReady ? String(router.query.id) : null;
  const editor = useEventEditor(id);
  const { draft, update, updateContent, save } = editor;
  const def = draft ? getDefinition(draft.templateId) : undefined;

  const { pane, goToPane } = useEditorPanes(!!editor.draft, editor.draft?.sections ?? null);
  const [device, setDevice] = useState<Device>("phone");
  const actions = usePublishActions(editor);
  // "Saved 2 min ago" stays fresh.
  useNow(SAVED_LABEL_TICK_MS);

  const { library, addToLibrary, mediaById, picker, pick, closePicker } = useEditorMedia(id);
  const rsvps = useResource<Rsvp[]>(id ? `/api/admin/events/${id}/rsvps` : null);
  const { sections, checklist, ready } = useEditorChecklist(draft, def);
  const previewEvent = useMemo(() => (draft ? buildPreviewEvent(draft, library, sections) : null), [draft, library, sections]);

  const formProps: FormProps | null =
    draft && def ? { event: draft, def, languages: draft.languages, update, updateContent, library, mediaById, addToLibrary, pick } : null;

  return (
    <AuthGate title={draft?.name ?? "Event"}>
      <div className="admin-editor ui-root">
        <LoadState loading={!draft && !editor.loadError} error={editor.loadError ?? undefined}>
          {draft && formProps && def ? (
            <>
              <EditorHeader
                draft={draft}
                def={def}
                saveState={editor.saveState}
                saveLabel={saveLabel(editor.saveState, editor.savedAt)}
                onRetry={() => void save()}
                device={device}
                onDevice={setDevice}
                actions={actions}
                ready={ready}
              />

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

                <EditorMain draft={draft} formProps={formProps} sections={sections} editor={editor} />

                {previewEvent && <LivePreview eventId={draft.id} event={previewEvent} device={device} />}
              </div>

              <PublishErrorDialog error={actions.publishError} onClose={actions.clearPublishError} />

              {picker && (
                <MediaPicker
                  open
                  kind={picker.kind}
                  title={picker.title}
                  eventId={draft.id}
                  library={library}
                  onUploaded={addToLibrary}
                  onPick={picker.onPick}
                  onClose={closePicker}
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
