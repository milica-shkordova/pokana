import { fillSubject } from "@pokanito/shared";
import { Card, CardHeader, Field, FormGrid, Input, SwitchRow } from "@pokanito/ui";
import { PREVIEW_EVENT, PREVIEW_GUEST } from "./constants";
import type { SectionProps } from "./types";

export default function RsvpEmailsSection({ form, set, menuText }: SectionProps & { menuText: string }) {
  return (
    <Card id="rsvp" className="ui-stack">
      <CardHeader
        title="RSVP emails"
        subtitle="How every reply email looks. The address it goes to is set per event in the editor."
      />
      <FormGrid>
        <Field label="Sender name">
          <Input
            value={form.senderName}
            onChange={(e) => set("senderName", e.target.value)}
          />
        </Field>
        <Field
          label="Sent from"
          hint="Must be on a domain verified in Resend"
        >
          <Input
            type="email"
            value={form.fromAddress}
            onChange={(e) => set("fromAddress", e.target.value)}
          />
        </Field>
      </FormGrid>
      <Field
        label="Subject line"
        hint="{гостин} = guest name, {настан} = event name"
      >
        <Input
          value={form.subjectTemplate}
          onChange={(e) => set("subjectTemplate", e.target.value)}
        />
      </Field>
      <div className="admin-email-preview">
        <div className="admin-email-preview__bar">Preview</div>
        <div className="admin-email-preview__body">
          <b>
            {fillSubject(
              form.subjectTemplate,
              PREVIEW_GUEST,
              PREVIEW_EVENT,
            )}
          </b>
          <span>
            Доаѓа: <b>Да</b> · Гости: <b>2</b>
          </span>
          <span>
            Мени: {(menuText.split(",")[0] || "Месо").trim()},{" "}
            {(menuText.split(",")[2] || "Вегетаријанско").trim()}
          </span>
          <span className="ui-muted">Порака: „Едвај чекаме!“</span>
        </div>
      </div>
      <SwitchRow
        label="Send me a copy"
        hint={`Every RSVP also goes to ${form.contactEmail}, so you can help if a client misses one.`}
        checked={form.ccOwnerOnRsvp}
        onChange={(v) => set("ccOwnerOnRsvp", v)}
      />
      <SwitchRow
        label="Daily summary for clients"
        hint="One email a day with totals, instead of one per reply."
        checked={form.clientDailyDigest}
        onChange={(v) => set("clientDailyDigest", v)}
      />
    </Card>
  );
}
