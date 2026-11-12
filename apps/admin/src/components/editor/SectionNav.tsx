import { useState } from "react";
import {
  findPlaceholders,
  isBlank,
  type ChecklistItem,
  type EventDetail,
  type SectionKind,
  type SectionState,
} from "@pokanito/shared";
import type { TemplateDefinition } from "@pokanito/templates/definitions";
import { Checkbox, Dot, cx } from "@pokanito/ui";
import { IconAlert, IconCheck } from "../Icons";

export type Pane = "basics" | "photos" | "theme" | "client" | "replies" | SectionKind;

type DotTone = "ok" | "warn" | "off";

function sectionStatus(e: EventDetail, id: SectionKind, enabled: boolean): { tone: DotTone; meta: string } {
  if (!enabled) return { tone: "off", meta: "off" };
  const c = e.content;
  const ph = (v: unknown) => findPlaceholders(v).length > 0;
  const warn = { tone: "warn" as const, meta: "needs info" };
  switch (id) {
    case "welcome":
      return isBlank(c.welcome?.text) || ph(c.welcome) ? warn : { tone: "ok", meta: "done" };
    case "program":
      return !c.program?.items.length || ph(c.program) ? warn : { tone: "ok", meta: String(c.program.items.length) };
    case "info":
      return !c.info?.items.length || ph(c.info) ? warn : { tone: "ok", meta: String(c.info.items.length) };
    case "people":
      return !c.people?.items.length || ph(c.people) ? warn : { tone: "ok", meta: String(c.people.items.length) };
    case "godparents":
      return isBlank(c.godparents?.names) || ph(c.godparents) ? warn : { tone: "ok", meta: "done" };
    case "gallery":
      return !c.gallery?.photos.length ? warn : { tone: "ok", meta: String(c.gallery.photos.length) };
    case "rsvp":
      return !e.rsvpDeadline || !e.rsvpEmails.length ? warn : { tone: "ok", meta: "on" };
    case "location":
      return !c.location?.venues.length || ph(c.location) ? warn : { tone: "ok", meta: String(c.location.venues.length) };
    case "music":
      return !c.music?.mediaId ? warn : { tone: "ok", meta: "on" };
    case "footer":
      return ph(c.footer) ? warn : { tone: "ok", meta: "done" };
    case "countdown":
      return { tone: "ok", meta: "on" };
  }
}

interface Props {
  event: EventDetail;
  def: TemplateDefinition;
  sections: SectionState[];
  pane: Pane;
  onPane: (p: Pane) => void;
  onSections: (s: SectionState[]) => void;
  checklist: ChecklistItem[];
  onApproved: (v: boolean) => void;
  rsvpCount: number;
}

export default function SectionNav({ event, def, sections, pane, onPane, onSections, checklist, onApproved, rsvpCount }: Props) {
  const [adding, setAdding] = useState(false);
  const label = (id: SectionKind) => def.sections.find((s) => s.id === id)?.label ?? id;
  const disabled = sections.filter((s) => !s.enabled);

  const filledSlots = def.photoSlots.filter((s) => event.content.photos?.[s.id]).length;
  const missingSlots = def.photoSlots.filter((s) => s.required && !event.content.photos?.[s.id]).length;
  const basicsOk = checklist.find((c) => c.id === "basics")?.ok;
  const clientOk = !!event.name.trim() && !!event.clientName.trim();

  const toggle = (id: SectionKind, enabled: boolean) => onSections(sections.map((s) => (s.id === id ? { ...s, enabled } : s)));

  const item = (key: Pane, text: string, tone: DotTone, meta: string) => (
    <button type="button" className={cx("admin-secnav__item", pane === key && "admin-secnav__item--on")} aria-current={pane === key ? "true" : undefined} onClick={() => onPane(key)}>
      <Dot tone={tone} />
      <span className="admin-secnav__label">{text}</span>
      <span className="admin-secnav__meta">{meta}</span>
    </button>
  );

  return (
    <nav aria-label="Invitation sections" className="admin-editor__nav">
      <div className="admin-secnav">
        <span className="admin-secnav__title">Sections</span>
        {item("basics", "Basics", basicsOk ? "ok" : "warn", basicsOk ? "done" : "needs info")}
        {item("photos", "Photos", missingSlots ? "warn" : "ok", missingSlots ? `${missingSlots} empty` : String(filledSlots))}
        {sections.map((s) => {
          const st = sectionStatus(event, s.id, s.enabled);
          return <div key={s.id}>{item(s.id, label(s.id), st.tone, st.meta)}</div>;
        })}
        {item("theme", "Theme", "ok", def.themeOptions.length ? "colours" : "fixed")}
        {!event.isDefaults && item("client", "Client & sharing", clientOk ? "ok" : "warn", clientOk ? "done" : "needs info")}
        {!event.isDefaults && item("replies", "Replies", rsvpCount ? "ok" : "off", String(rsvpCount))}
        {adding ? (
          <div className="admin-secnav__add">
            {disabled.length === 0 ? (
              <span className="admin-muted">Every section is already on.</span>
            ) : (
              disabled.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="admin-secnav__add-item"
                  onClick={() => {
                    toggle(s.id, true);
                    onPane(s.id);
                    setAdding(false);
                  }}
                >
                  + {label(s.id)}
                </button>
              ))
            )}
            <button type="button" className="admin-secnav__add-item admin-muted" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="admin-secnav__addbtn" onClick={() => setAdding(true)} aria-expanded={adding}>
            + Add section
          </button>
        )}
      </div>

      {!event.isDefaults && (
      <div className="admin-checklist">
        <span className="admin-checklist__title">Ready to publish?</span>
        {checklist.map((c) => (
          <div key={c.id} className={cx("admin-checklist__item", c.ok ? "admin-checklist__item--ok" : "admin-checklist__item--todo")}>
            {c.ok ? <IconCheck /> : <IconAlert />}
            {c.label}
          </div>
        ))}
        <Checkbox label="Client approved the preview" checked={event.clientApproved} onChange={(e) => onApproved(e.target.checked)} />
      </div>
      )}
    </nav>
  );
}
