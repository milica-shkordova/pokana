import { Field, FormGrid, Input, SwitchRow } from "@pokanito/ui";
import { EditorCard } from "./fields";
import type { FormProps } from "./context";

/** Admin-only details: never rendered on the invitation itself. */
export default function ClientForm({ event, update }: FormProps) {
  return (
    <EditorCard
      title="Client & sharing"
      aside="Only for you and the client — not shown on the invitation"
    >
      <FormGrid>
        <Field
          label="Event name"
          hint="Admin list & link preview, e.g. “Ана & Марко”"
        >
          <Input
            value={event.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </Field>
        <Field label="Client name">
          <Input
            value={event.clientName}
            onChange={(e) => update({ clientName: e.target.value })}
          />
        </Field>
        <Field label="Client contact">
          <Input
            value={event.clientContact}
            onChange={(e) => update({ clientContact: e.target.value })}
          />
        </Field>
        <Field
          label="Expected guests"
          hint="Shows as received / expected in the events list"
        >
          <Input
            type="number"
            min={0}
            value={event.expectedGuests ?? ""}
            onChange={(e) =>
              update({
                expectedGuests:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </Field>
        <Field
          label="Guest access code"
          hint="Guests type it before the invitation opens. Leave empty for none."
        >
          <Input
            value={event.accessCode ?? ""}
            onChange={(e) => update({ accessCode: e.target.value || null })}
          />
        </Field>
      </FormGrid>
      <SwitchRow
        label="Hide from Google"
        hint="Only people with the link can find it (noindex)."
        checked={event.noindex}
        onChange={(v) => update({ noindex: v })}
      />
    </EditorCard>
  );
}
