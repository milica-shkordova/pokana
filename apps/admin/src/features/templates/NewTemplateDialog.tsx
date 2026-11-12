import { CATEGORY_LABELS, TEMPLATE_CATEGORIES, type TemplateCategory, type TemplateSummary } from "@pokanito/shared";
import { Alert, Button, Dialog, Field, Input, Select } from "@pokanito/ui";
import { useCreateTemplate } from "./useCreateTemplate";

// ── New template = variant of an existing layout ──────────────────────────────

export default function NewTemplateDialog({
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
  const { bases, base, baseId, setBaseId, name, setName, category, setCategory, saving, error, submit } = useCreateTemplate({
    open,
    templates,
    initialBase,
    onCreated,
  });

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
