import { parseCommaList, RSVP_MODE_LABELS, utcToZoned, zonedToUtc } from "@pokanito/shared";
import { Checkbox, Field, FormGrid, Input } from "@pokanito/ui";
import { EditorCard, LocalizedField } from "./fields";
import { setContent, type SectionFormProps } from "./context";

export default function RsvpForm({ event, languages, updateContent, update, label, def }: SectionFormProps) {
  const r = event.content.rsvp ?? { mode: def.rsvpMode, menuOptions: [], askAllergies: false, askMessage: false };
  const set = setContent(updateContent, "rsvp");
  const deadline = event.rsvpDeadline ? utcToZoned(event.rsvpDeadline).date : "";
  return (
    <EditorCard title={label} aside={RSVP_MODE_LABELS[r.mode]}>
      <FormGrid>
        <LocalizedField label="Heading" value={r.heading} languages={languages} onChange={(v) => set({ ...r, heading: v })} />
        <LocalizedField label="Note under the heading" value={r.note} languages={languages} onChange={(v) => set({ ...r, note: v })} />
        <Field label="Reply by" hint="After this day the form shows a closed message">
          <Input type="date" value={deadline} onChange={(e) => update({ rsvpDeadline: e.target.value ? zonedToUtc(e.target.value, "00:00") : null })} />
        </Field>
        {(r.mode === "guests-with-menu" || r.menuOptions.length > 0) && (
          <Field label="Menu options" hint="Separated by commas. Leave empty to not ask.">
            <Input
              defaultValue={r.menuOptions.join(", ")}
              onBlur={(e) =>
                set({
                  ...r,
                  menuOptions: parseCommaList(e.target.value),
                })
              }
            />
          </Field>
        )}
      </FormGrid>
      <div className="ui-row ui-row--wrap">
        <Checkbox label="Ask about allergies" checked={r.askAllergies || r.mode === "kids"} disabled={r.mode === "kids"} onChange={(e) => set({ ...r, askAllergies: e.target.checked })} />
        <Checkbox label="Let guests leave a message" checked={r.askMessage} onChange={(e) => set({ ...r, askMessage: e.target.checked })} />
      </div>
      <p className="ui-muted">Replies go to the addresses in Basics › “Send RSVP replies to”.</p>
    </EditorCard>
  );
}
