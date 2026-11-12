import { LOCALE_LABELS, LOCALES, type Settings } from "@pokanito/shared";
import { Card, CardHeader, Field, FormGrid, Input, Select } from "@pokanito/ui";
import type { SectionProps } from "./types";
import { deadlineOptions } from "./utils";

export default function DefaultsSection({
  form,
  set,
  menuText,
  onMenuText,
}: SectionProps & { menuText: string; onMenuText: (v: string) => void }) {
  return (
    <Card id="defaults" className="ui-stack">
      <CardHeader
        title="Invitation defaults"
        subtitle="Pre-filled on every new event. You can still change them per event."
      />
      <FormGrid>
        <Field label="Language">
          <Select
            value={form.defaultLanguage}
            onChange={(e) =>
              set(
                "defaultLanguage",
                e.target.value as Settings["defaultLanguage"],
              )
            }
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_LABELS[l]}
              </option>
            ))}
            <option value="both">Both (toggle)</option>
          </Select>
        </Field>
        <Field label="RSVP deadline">
          <Select
            value={String(form.defaultRsvpDeadlineDays)}
            onChange={(e) =>
              set("defaultRsvpDeadlineDays", Number(e.target.value))
            }
          >
            {deadlineOptions(form.defaultRsvpDeadlineDays).map((d) => (
              <option key={d} value={d}>
                {d} days before
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Menu options" hint="Separated by commas">
          <Input
            value={menuText}
            onChange={(e) => onMenuText(e.target.value)}
          />
        </Field>
      </FormGrid>
    </Card>
  );
}
