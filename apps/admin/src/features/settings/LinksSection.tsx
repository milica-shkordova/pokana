import { Card, CardHeader, Field, FormGrid, Input, Select, SwitchRow } from "@pokanito/ui";
import { KEEP_ONLINE_MONTHS } from "./constants";
import type { SectionProps } from "./types";

export default function LinksSection({ form, set }: SectionProps) {
  return (
    <Card id="links" className="ui-stack">
      <CardHeader
        title="Links & publishing"
        subtitle="Where invitations live and what happens after the event."
      />
      <FormGrid>
        <Field label="Invitation domain">
          <Input
            value={form.domain}
            onChange={(e) => set("domain", e.target.value)}
          />
        </Field>
        <Field label="Keep online after the event">
          <Select
            value={String(form.keepOnlineMonths)}
            onChange={(e) =>
              set("keepOnlineMonths", Number(e.target.value))
            }
          >
            {KEEP_ONLINE_MONTHS.map((m) => (
              <option key={m} value={m}>
                {m} months
              </option>
            ))}
            <option value="0">Forever</option>
          </Select>
        </Field>
      </FormGrid>
      <SwitchRow
        label="Hide invitations from Google"
        hint="Only people with the link can find them."
        checked={form.defaultNoindex}
        onChange={(v) => set("defaultNoindex", v)}
      />
      <SwitchRow
        label="Ask for a password by default"
        hint="New events get a short access code that guests type before the invitation opens."
        checked={form.defaultPassword}
        onChange={(v) => set("defaultPassword", v)}
      />
    </Card>
  );
}
