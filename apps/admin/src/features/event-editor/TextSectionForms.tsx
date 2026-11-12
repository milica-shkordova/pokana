import { FormGrid } from "@pokanito/ui";
import { EditorCard, LocalizedField } from "./fields";
import { setContent, type SectionFormProps } from "./context";

export function WelcomeForm({ event, languages, updateContent, label }: SectionFormProps) {
  const w = event.content.welcome ?? { text: {} };
  const set = setContent(updateContent, "welcome");
  return (
    <EditorCard title={label} aside="The personal note under the hero">
      <FormGrid>
        <LocalizedField label="Heading" value={w.heading} languages={languages} onChange={(v) => set({ ...w, heading: v })} />
        <LocalizedField
          label="Text"
          value={w.text}
          languages={languages}
          multiline
          rows={6}
          hint="A blank line starts a new paragraph."
          onChange={(v) => set({ ...w, text: v })}
        />
        <LocalizedField label="Signature" value={w.signature} languages={languages} onChange={(v) => set({ ...w, signature: v })} />
      </FormGrid>
    </EditorCard>
  );
}

export function CountdownForm({ event, languages, updateContent, label }: SectionFormProps) {
  const cd = event.content.countdown ?? {};
  return (
    <EditorCard title={label} aside="Counts down to the event date & time in Basics">
      <FormGrid>
        <LocalizedField
          label="Heading"
          value={cd.heading}
          languages={languages}
          onChange={(v) => setContent(updateContent, "countdown")({ ...cd, heading: v })}
        />
      </FormGrid>
    </EditorCard>
  );
}

export function GodparentsForm({ event, languages, updateContent, label }: SectionFormProps) {
  const g = event.content.godparents ?? { names: {} };
  const set = setContent(updateContent, "godparents");
  return (
    <EditorCard title={label} aside="Кумови">
      <FormGrid>
        <LocalizedField label="Heading" value={g.heading} languages={languages} onChange={(v) => set({ ...g, heading: v })} />
        <LocalizedField label="Names" value={g.names} languages={languages} onChange={(v) => set({ ...g, names: v })} />
      </FormGrid>
    </EditorCard>
  );
}

export function FooterForm({ event, languages, updateContent, label }: SectionFormProps) {
  const f = event.content.footer ?? {};
  const set = setContent(updateContent, "footer");
  return (
    <EditorCard title={label}>
      <FormGrid>
        <LocalizedField label="Closing line" value={f.text} languages={languages} onChange={(v) => set({ ...f, text: v })} />
        <LocalizedField label="Contact line" placeholder="мама Ивана · 070 123 456" value={f.contact} languages={languages} onChange={(v) => set({ ...f, contact: v })} />
      </FormGrid>
    </EditorCard>
  );
}
