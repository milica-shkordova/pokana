import { useState } from "react";
import type { ChecklistItem, EventDetail, SectionKind, SectionState } from "@pokanito/shared";
import type { TemplateDefinition } from "@pokanito/templates/definitions";
import { Checkbox, Dot, cx, IconAlert, IconCheck } from "@pokanito/ui";
import type { DotTone, Pane } from "./types";
import { sectionStatus } from "./utils";

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
              <span className="ui-muted">Every section is already on.</span>
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
            <button type="button" className="admin-secnav__add-item ui-muted" onClick={() => setAdding(false)}>
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
