import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  CATEGORY_LABELS,
  eventUrl,
  TEMPLATE_CATEGORIES,
  type EventDetail,
  type SectionState,
  type TemplateCategory,
  type TemplateCreateInput,
  type TemplateStatus,
  type TemplateSummary,
  type TemplateUpdateInput,
} from "@pokanito/shared";
import { getDefinition, resolveSections } from "@pokanito/templates/definitions";
import {
  Alert,
  Button,
  Card,
  Chips,
  CategoryLabel,
  Dialog,
  Field,
  Input,
  Segmented,
  Select,
  Tabs,
  Textarea,
  ToggleChip,
  TemplateStatusBadge,
  buttonClassName,
  cx,
  useToast,
  LoadState,
  errorMessage,
} from "@pokanito/ui";
import AdminLayout from "@/components/AdminLayout";
import TemplateThumb, { thumbStyle } from "@/components/TemplateThumb";
import { api, useResource, WEB_URL } from "@/lib/api";

type Cat = "all" | TemplateCategory;

const usageLabel = (t: TemplateSummary) =>
  !t.implemented ? "In design" : t.usageCount ? `Used in ${t.usageCount} event${t.usageCount === 1 ? "" : "s"}` : "No events yet";

export default function TemplatesPage() {
  const router = useRouter();
  const toast = useToast();
  const { data, loading, error, reload, mutate } = useResource<TemplateSummary[]>("/api/admin/templates");
  const [cat, setCat] = useState<Cat>("all");
  const [selId, setSelId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const list = data ?? [];
  const items = list.filter((t) => cat === "all" || t.category === cat);
  const sel = list.find((t) => t.id === selId) ?? items[0];

  const replace = (updated: TemplateSummary) => mutate(list.map((t) => (t.id === updated.id ? updated : t)));

  const cats = [
    { value: "all" as Cat, label: "All", count: list.length },
    ...TEMPLATE_CATEGORIES.map((c) => ({ value: c as Cat, label: CATEGORY_LABELS[c].one, count: list.filter((t) => t.category === c).length })),
  ];

  return (
    <AdminLayout
      kicker="Library"
      title="Templates"
      actions={
        <Button iconLeft="+" onClick={() => setCreating(true)}>
          New template
        </Button>
      }
    >
      <LoadState loading={loading && !data} error={error} onRetry={reload}>
        <div className="admin-split">
          <div className="admin-split__main ui-stack">
            <Tabs variant="chips" items={cats} value={cat} onChange={setCat} aria-label="Category" />
            <div className="admin-template-grid admin-template-grid--library">
              {items.map((t) => {
                const on = sel?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    className={cx("admin-template-card", on && "admin-template-card--on")}
                    onClick={() => setSelId(t.id)}
                  >
                    <TemplateThumb t={t}>
                      <TemplateStatusBadge status={t.status} size="sm" />
                    </TemplateThumb>
                    <span className="admin-template-card__body">
                      <CategoryLabel>{CATEGORY_LABELS[t.category].one}</CategoryLabel>
                      <span className="admin-template-card__name">{t.name}</span>
                      <span className="ui-muted">{t.isVariant ? `${usageLabel(t)} · variant of ${getDefinition(t.layoutId)?.name ?? t.layoutId}` : usageLabel(t)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {sel && (
            <TemplatePanel
              key={sel.id}
              t={sel}
              onChange={replace}
              onDeleted={() => {
                mutate(list.filter((x) => x.id !== sel.id));
                setSelId(null);
              }}
              onOpenDefaults={async () => {
                try {
                  const { eventId } = await api.post<{ eventId: string }>(`/api/admin/templates/${sel.id}/defaults`);
                  await router.push(`/events/${eventId}`);
                } catch (err) {
                  toast(errorMessage(err), "error");
                }
              }}
            />
          )}
        </div>
      </LoadState>

      <NewTemplateDialog
        open={creating}
        templates={list}
        initialBase={sel?.implemented ? sel.id : undefined}
        onClose={() => setCreating(false)}
        onCreated={(t) => {
          mutate([...list, t]);
          setCat("all");
          setSelId(t.id);
          setCreating(false);
          toast(`“${t.name}” created as a draft. Set its palette, sections and defaults, then make it Live.`);
        }}
      />
    </AdminLayout>
  );
}

// ── Side panel: every field of the selected template is editable here ────────

function TemplatePanel({
  t,
  onChange,
  onDeleted,
  onOpenDefaults,
}: {
  t: TemplateSummary;
  onChange: (t: TemplateSummary) => void;
  onDeleted: () => void;
  onOpenDefaults: () => Promise<void>;
}) {
  const toast = useToast();
  const def = getDefinition(t.layoutId);
  const [name, setName] = useState(t.name);
  const [description, setDescription] = useState(t.description);
  const [thumbLabel, setThumbLabel] = useState(t.thumb.label);
  const [openingDefaults, setOpeningDefaults] = useState(false);
  const [editingColour, setEditingColour] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const style = thumbStyle(t);

  // Palette & sections live in the template's defaults event (what new events copy).
  const [defaultsId, setDefaultsId] = useState(t.defaultsEventId);
  const defaults = useResource<EventDetail>(defaultsId ? `/api/admin/events/${defaultsId}` : null);
  // Unsaved panel edits sit on top of the stored defaults until the autosave returns.
  const [local, setLocal] = useState<Partial<Pick<EventDetail, "theme" | "sections">>>({});
  const theme: Record<string, string> = {
    ...(def ? Object.fromEntries(def.themeOptions.map((o) => [o.key, o.default])) : {}),
    ...(defaults.data?.theme ?? {}),
    ...(local.theme ?? {}),
  };
  const sections: SectionState[] = def ? resolveSections(def, local.sections ?? defaults.data?.sections) : [];

  const patch = async (body: TemplateUpdateInput, message = "Saved") => {
    try {
      onChange(await api.patch<TemplateSummary>(`/api/admin/templates/${t.id}`, body));
      toast(message);
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  /** Creates the defaults event on first edit, then autosaves to it like the editor does. */
  const ensureDefaults = async () => {
    if (defaultsId) return defaultsId;
    const { eventId } = await api.post<{ eventId: string }>(`/api/admin/templates/${t.id}/defaults`);
    setDefaultsId(eventId);
    onChange({ ...t, defaultsEventId: eventId });
    return eventId;
  };
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const patchDefaults = (body: Partial<Pick<EventDetail, "theme" | "sections">>) => {
    const next = { ...local, ...body };
    setLocal(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const id = await ensureDefaults();
        defaults.mutate(await api.patch<EventDetail>(`/api/admin/events/${id}`, next));
        setLocal({});
      } catch (err) {
        toast(errorMessage(err), "error");
      }
    }, 400);
  };
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const setColour = (key: string, value: string) => patchDefaults({ theme: { ...theme, [key]: value } });
  const toggleSection = (id: string) => patchDefaults({ sections: sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)) });

  const editing = def?.themeOptions.find((o) => o.key === editingColour);

  return (
    <Card className="admin-split__side ui-stack admin-template-panel" aria-label="Template details">
      <div className="ui-stack--8">
        <CategoryLabel>{CATEGORY_LABELS[t.category].one}</CategoryLabel>
        <input
          className="admin-detail-title admin-inline-edit"
          aria-label="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== t.name && void patch({ name: name.trim() }, "Name saved")}
        />
        <span className="ui-muted">
          {usageLabel(t)}
          {t.isVariant && ` · variant of the ${def?.name ?? t.layoutId} layout`}
        </span>
      </div>

      <div className="ui-stack--8">
        <span className="ui-label">Status on landing page</span>
        <Segmented<TemplateStatus>
          label="Status"
          value={t.status === "draft" ? "hidden" : t.status}
          onChange={(v) => void patch({ status: v }, "Landing page updated")}
          options={[
            { value: "live", label: "Live" },
            { value: "coming-soon", label: "Coming soon" },
            { value: "hidden", label: "Hidden" },
          ]}
        />
        <span className="ui-muted">Live shows “View live demo”. Coming soon shows “Notify me”. Hidden removes the card.</span>
        {t.status === "live" && !t.demoSlug && <Alert tone="warning">No published demo, so the card won&apos;t have a working “View live demo”.</Alert>}
        {t.status === "live" && !t.implemented && <Alert tone="warning">This template isn&apos;t built yet.</Alert>}
      </div>

      <Field label="Description" hint="Shown on the landing page card">
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => description !== t.description && void patch({ description })} />
      </Field>

      {t.isVariant && (
        <Field label="Category">
          <Select value={t.category} onChange={(e) => void patch({ category: e.target.value as TemplateCategory })}>
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c].one}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <div className="ui-stack--8">
        <span className="ui-label">Card</span>
        <div className="admin-thumb-edit">
          <Input aria-label="Card word" value={thumbLabel} maxLength={24} onChange={(e) => setThumbLabel(e.target.value)} onBlur={() => thumbLabel !== t.thumb.label && void patch({ thumbLabel: thumbLabel.trim() || null })} />
          <label className="admin-colour" title="Card background">
            <input type="color" value={style.bg} onChange={(e) => void patch({ thumbBg: e.target.value })} />
            <span style={{ background: style.bg }} />
          </label>
          <label className="admin-colour" title="Card text colour">
            <input type="color" value={style.ink} onChange={(e) => void patch({ thumbInk: e.target.value })} />
            <span style={{ background: style.ink }} />
          </label>
          {(t.thumb.bg || t.thumb.ink) && (
            <Button variant="link" onClick={() => void patch({ thumbBg: null, thumbInk: null })}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {def ? (
        <>
          <div className="ui-stack--8">
            <span className="ui-label">Default palette</span>
            <div className="ui-swatches">
              {def.themeOptions.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className={cx("ui-swatch", editingColour === o.key && "ui-swatch--on")}
                  style={{ background: theme[o.key] }}
                  title={`${o.label}: ${theme[o.key]}`}
                  aria-label={`${o.label} colour`}
                  aria-pressed={editingColour === o.key}
                  onClick={() => setEditingColour(editingColour === o.key ? null : o.key)}
                />
              ))}
              {!def.themeOptions.length && <span className="ui-muted">This layout has no colour options.</span>}
            </div>
            {editing && (
              <div className="admin-palette-edit">
                <span className="ui-muted">{editing.label}</span>
                <div className="ui-swatches">
                  {[...new Set([editing.default, ...editing.options])].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cx("ui-swatch", theme[editing.key] === c && "ui-swatch--on")}
                      style={{ background: c }}
                      aria-label={c}
                      onClick={() => setColour(editing.key, c)}
                    />
                  ))}
                  <label className="admin-colour" title="Custom colour">
                    <input type="color" value={theme[editing.key]} onChange={(e) => setColour(editing.key, e.target.value)} />
                    <span className="admin-colour__plus">+</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="ui-stack--8">
            <span className="ui-label">Sections included</span>
            <Chips>
              {sections.map((s) => {
                const sd = def.sections.find((x) => x.id === s.id);
                return (
                  <ToggleChip
                    key={s.id}
                    pressed={s.enabled}
                    disabled={sd?.required}
                    title={sd?.required ? "Always included" : s.enabled ? "Click to leave out of new events" : "Click to include in new events"}
                    onClick={() => toggleSection(s.id)}
                  >
                    {sd?.label ?? s.id}
                  </ToggleChip>
                );
              })}
            </Chips>
            <span className="ui-muted">New events start with these on. Order and text are set in Edit defaults.</span>
          </div>

          <div className="ui-stack--8">
            <span className="ui-label">Photo slots</span>
            <span>{def.photoSlots.map((p) => `${p.label} (${p.aspect})`).join(" · ")}</span>
            <span className="ui-muted">Part of the {def.name} layout. Default photos are set in Edit defaults.</span>
          </div>
        </>
      ) : (
        <Alert tone="info">This template is still in design. It can be listed as “Coming soon” but not used for events yet.</Alert>
      )}

      <div className="admin-detail-actions">
        {def ? (
          <a href={`/events/new?template=${t.id}`} className={buttonClassName()}>
            Use for new event
          </a>
        ) : (
          <Button disabled>Use for new event</Button>
        )}
        <Button
          variant="secondary"
          disabled={!def}
          loading={openingDefaults}
          onClick={async () => {
            setOpeningDefaults(true);
            await onOpenDefaults();
            setOpeningDefaults(false);
          }}
        >
          Edit defaults
        </Button>
        {t.demoSlug ? (
          <a className={buttonClassName({ variant: "secondary" })} href={eventUrl(WEB_URL, t.demoSlug)} target="_blank" rel="noreferrer">
            Open demo ↗
          </a>
        ) : (
          <Button variant="secondary" disabled>
            Open demo ↗
          </Button>
        )}
        {t.isVariant && (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
            Delete template
          </Button>
        )}
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete “${t.name}”?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await api.delete(`/api/admin/templates/${t.id}`);
                  setConfirmDelete(false);
                  toast("Template deleted");
                  onDeleted();
                } catch (err) {
                  setConfirmDelete(false);
                  toast(errorMessage(err), "error");
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Its defaults and demo are deleted too. Templates that events use can&apos;t be deleted. Set them to Hidden instead.</p>
      </Dialog>
    </Card>
  );
}

// ── New template = variant of an existing layout ──────────────────────────────

function NewTemplateDialog({
  open,
  templates,
  initialBase,
  onClose,
  onCreated,
}: {
  open: boolean;
  templates: TemplateSummary[];
  initialBase?: string;
  onClose: () => void;
  onCreated: (t: TemplateSummary) => void;
}) {
  const bases = templates.filter((t) => t.implemented);
  const [baseId, setBaseId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBaseId(initialBase ?? bases[0]?.id ?? "");
    setName("");
    setCategory("");
    setError(null);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const base = bases.find((b) => b.id === baseId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await api.post<TemplateSummary>("/api/admin/templates", {
        baseId,
        name: name.trim(),
        category: category || undefined,
      } satisfies TemplateCreateInput);
      onCreated(created);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New template"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="new-template" loading={saving} disabled={!baseId || !name.trim()}>
            Create template
          </Button>
        </>
      }
    >
      <form id="new-template" className="ui-stack" onSubmit={submit}>
        <p className="ui-muted">
          A new template reuses an existing layout with its own name, palette, sections and default text. A brand-new layout still needs a developer.
        </p>
        {error && <Alert tone="danger">{error}</Alert>}
        <Field label="Start from">
          <Select value={baseId} onChange={(e) => setBaseId(e.target.value)}>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.isVariant ? " (variant)" : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Name" hint="e.g. “Olive Garden Wedding”">
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
        </Field>
        <Field label="Category">
          <Select value={category} onChange={(e) => setCategory(e.target.value as TemplateCategory | "")}>
            <option value="">Same as {base ? CATEGORY_LABELS[base.category].one.toLowerCase() : "the base"}</option>
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c].one}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Dialog>
  );
}
