import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  CATEGORY_LABELS,
  TEMPLATE_CATEGORIES,
  type EventCreateInput,
  type EventDetail,
  type Lead,
  type TemplateCategory,
  type TemplateSummary,
} from "@momentelo/shared";
import { getDefinition } from "@momentelo/templates/definitions";
import { Button, CategoryLabel, Spinner, Tabs, TemplateStatusBadge, cx } from "@momentelo/ui";
import AdminLayout from "@/components/AdminLayout";
import LoadState, { IssueList } from "@/components/LoadState";
import { thumbStyle } from "@/components/TemplateThumb";
import { IconBack, IconChat, IconCheck, IconSearch } from "@/components/Icons";
import { api, useResource, WEB_URL } from "@/lib/api";
import { formatDate } from "@/lib/format";

/** Tries to read "12 Jun 2027", "2027-06-12", "12.06.2027" from a lead (noon UTC, so the Skopje day stays right). */
function guessDate(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const dmy = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const iso = dmy ? `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}` : null;
  const t = Date.parse(iso ?? text);
  if (Number.isNaN(t)) return undefined;
  const d = new Date(t);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12)).toISOString();
}

type Cat = "all" | TemplateCategory;

/** A template drawn as a small phone: its preview photo, or its colours and monogram. */
function PhoneThumb({ t, size = "sm" }: { t: TemplateSummary; size?: "sm" | "lg" }) {
  const s = thumbStyle(t);
  const def = getDefinition(t.layoutId);
  return (
    <span className={cx("admin-pick-phone", `admin-pick-phone--${size}`)}>
      <span className="admin-pick-phone__screen" style={{ background: s.bg, color: s.ink, fontFamily: s.font }}>
        {t.previewUrl ? (
          <img src={t.previewUrl} alt="" />
        ) : (
          <>
            <span className="admin-pick-phone__eyebrow">{CATEGORY_LABELS[t.category].one}</span>
            <span className="admin-pick-phone__mono">{def?.thumb.mono ?? s.label}</span>
            <span className="admin-pick-phone__block" style={{ background: s.ink }} />
            <span className="admin-pick-phone__line" />
            <span className="admin-pick-phone__line admin-pick-phone__line--short" />
          </>
        )}
      </span>
    </span>
  );
}

/**
 * New event, step 1 (Admin · New event: choose a template): filter and pick
 * a template; the panel on the right shows what it includes and creates the
 * draft. `?template=<id>` (Templates › Use for new event) and `?lead=<id>`
 * skip straight to creating.
 */
export default function NewEventPage() {
  const router = useRouter();
  const leadId = typeof router.query.lead === "string" ? router.query.lead : null;
  const preset = typeof router.query.template === "string" ? router.query.template : null;
  const templates = useResource<TemplateSummary[]>("/api/admin/templates");
  const leads = useResource<Lead[]>("/api/admin/leads");
  const lead = leads.data?.find((l) => l.id === leadId) ?? null;

  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [cat, setCat] = useState<Cat>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const started = useRef(false);

  const usable = useMemo(() => (templates.data ?? []).filter((t) => t.implemented && t.status !== "hidden"), [templates.data]);
  const q = query.trim().toLowerCase();
  const shown = usable.filter(
    (t) => (cat === "all" || t.category === cat) && (!q || `${t.name} ${t.description}`.toLowerCase().includes(q)),
  );
  const cats = [
    { value: "all" as Cat, label: "All", count: usable.length },
    ...TEMPLATE_CATEGORIES.filter((c) => usable.some((t) => t.category === c)).map((c) => ({
      value: c as Cat,
      label: CATEGORY_LABELS[c].many,
      count: usable.filter((t) => t.category === c).length,
    })),
  ];
  const pick = usable.find((t) => t.id === selected) ?? shown[0] ?? null;
  const pickDef = pick ? getDefinition(pick.layoutId) : undefined;

  // A lead asking about a template that has no event yet.
  const suggestion = !leadId
    ? leads.data?.find((l) => l.templateId && !l.eventId && l.stage !== "lost" && usable.some((t) => t.id === l.templateId))
    : null;

  const create = async (templateId: string) => {
    if (creating) return;
    setCreating(templateId);
    setError(null);
    try {
      const created = await api.post<EventDetail>("/api/admin/events", {
        templateId,
        name: lead?.name || "New event",
        eventDate: guessDate(lead?.eventDate),
        leadId: leadId ?? undefined,
      } satisfies EventCreateInput);
      await router.replace(`/events/${created.id}`);
    } catch (err) {
      setError(err);
      setCreating(null);
    }
  };

  // Template chosen elsewhere (Templates page, or the lead's template): create immediately.
  useEffect(() => {
    if (started.current || !router.isReady || !templates.data || (leadId && !leads.data)) return;
    const id = preset ?? lead?.templateId ?? null;
    if (id && templates.data.some((t) => t.id === id && t.implemented)) {
      started.current = true;
      void create(id);
    }
  });

  const header = (
    <div className="admin-newhead">
      <Link href="/" className="admin-newhead__back" aria-label="Back to events">
        <IconBack />
      </Link>
      <div className="admin-newhead__titles">
        <nav className="admin-newhead__crumbs" aria-label="Breadcrumb">
          <Link href="/">Events</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">New event</span>
        </nav>
        <h1 className="ui-heading ui-heading--page">New event</h1>
      </div>
      <ol className="admin-steps" aria-label="Steps">
        <li className="admin-steps__step admin-steps__step--on" aria-current="step">
          <span className="admin-steps__num">1</span>
          Choose a template
        </li>
        <li className="admin-steps__line" aria-hidden />
        <li className="admin-steps__step">
          <span className="admin-steps__num">2</span>
          Customize &amp; publish
        </li>
      </ol>
    </div>
  );

  return (
    <AdminLayout title="New event" header={header}>
      <LoadState loading={!templates.data && !templates.error} error={templates.error} onRetry={templates.reload}>
        <div className="admin-new">
          <div className="admin-new__main">
            <div className="admin-new__filters">
              <Tabs variant="chips" items={cats} value={cat} onChange={setCat} aria-label="Category" />
              <label className="admin-search admin-new__search">
                <IconSearch />
                <span className="ui-sr-only">Search templates</span>
                <input type="search" placeholder="Search templates" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
            </div>

            {lead && (
              <div className="admin-lead-banner">
                <span className="admin-lead-banner__icon">
                  <IconChat />
                </span>
                <span>
                  <strong>For lead {lead.name}</strong>
                  <span className="admin-muted">
                    {lead.contact}
                    {lead.templateName ? ` · interested in ${lead.templateName}` : ""}. Their details fill the new draft.
                  </span>
                </span>
              </div>
            )}
            {suggestion && (
              <Link href={`/events/new?lead=${suggestion.id}`} className="admin-lead-banner admin-lead-banner--link">
                <span className="admin-lead-banner__icon">
                  <IconChat />
                </span>
                <span>
                  <strong>Starting from a lead?</strong>
                  <span className="admin-muted">
                    {suggestion.name} asked about {suggestion.templateName ?? "a template"}
                    {suggestion.eventDate ? ` for ${formatDate(guessDate(suggestion.eventDate) ?? suggestion.eventDate)}` : ""}. Use
                    these details →
                  </span>
                </span>
              </Link>
            )}

            <IssueList error={error} />

            {shown.length === 0 ? (
              <p className="admin-muted">No templates match “{query}”.</p>
            ) : (
              <div className="admin-pick-grid" role="listbox" aria-label="Templates">
                {shown.map((t) => {
                  const on = pick?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={cx("admin-pick", on && "admin-pick--on")}
                      onClick={() => setSelected(t.id)}
                      onDoubleClick={() => void create(t.id)}
                      disabled={!!creating}
                    >
                      <span className="admin-pick__thumb" style={{ background: thumbStyle(t).bg }}>
                        <span className="admin-pick__badge">
                          <TemplateStatusBadge status={t.status} size="sm" />
                        </span>
                        {on && (
                          <span className="admin-pick__check" aria-hidden>
                            {creating === t.id ? <Spinner /> : <IconCheck />}
                          </span>
                        )}
                        <PhoneThumb t={t} />
                      </span>
                      <span className="admin-pick__body">
                        <CategoryLabel>{CATEGORY_LABELS[t.category].one}</CategoryLabel>
                        <span className="admin-pick__name">{t.name}</span>
                        <span className="admin-pick__desc">{t.description}</span>
                        <span className="admin-muted admin-pick__usage">
                          {t.usageCount > 0 ? `Used in ${t.usageCount} event${t.usageCount === 1 ? "" : "s"}` : "New"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {pick && (
            <aside className="admin-new__panel" aria-label="Selected template">
              <div className="admin-new__stage" key={pick.id} style={{ background: thumbStyle(pick).bg }}>
                <PhoneThumb t={pick} size="lg" />
                {pick.demoSlug && (
                  <a className="admin-new__demo" href={`${WEB_URL}/${pick.demoSlug}`} target="_blank" rel="noreferrer">
                    Open live demo ↗
                  </a>
                )}
              </div>
              <div className="admin-new__info" key={`${pick.id}-info`}>
                <CategoryLabel>{CATEGORY_LABELS[pick.category].one}</CategoryLabel>
                <h2 className="admin-new__name">{pick.name}</h2>
                <p className="admin-muted">{pick.description}</p>
                {pickDef && (
                  <ul className="admin-new__facts">
                    <li>{pickDef.sections.length} sections</li>
                    <li>
                      {pickDef.photoSlots.length} photo slot{pickDef.photoSlots.length === 1 ? "" : "s"}
                    </li>
                    <li>MK / EN</li>
                  </ul>
                )}
                <Button block size="lg" loading={creating === pick.id} disabled={!!creating} onClick={() => void create(pick.id)}>
                  Use {pick.name} →
                </Button>
                <p className="admin-muted admin-new__note">
                  Opens the editor with this template’s defaults. You can switch template later; your content carries over.
                </p>
              </div>
            </aside>
          )}
        </div>
      </LoadState>
    </AdminLayout>
  );
}
