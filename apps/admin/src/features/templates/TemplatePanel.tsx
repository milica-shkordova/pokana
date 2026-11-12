import { CATEGORY_LABELS, TEMPLATE_CATEGORIES, type TemplateCategory, type TemplateStatus, type TemplateSummary } from "@pokanito/shared";
import { Alert, Card, CategoryLabel, Field, Segmented, Select, Textarea } from "@pokanito/ui";
import { STATUS_OPTIONS } from "./constants";
import TemplateCardEditor from "./TemplateCardEditor";
import TemplateDefaultsEditor from "./TemplateDefaultsEditor";
import TemplatePanelActions from "./TemplatePanelActions";
import { useTemplatePanel, type TemplatePanelCallbacks } from "./useTemplatePanel";
import { usageLabel } from "./utils";

// ── Side panel: every field of the selected template is editable here ────────

export default function TemplatePanel({ t, ...callbacks }: { t: TemplateSummary } & TemplatePanelCallbacks) {
  const panel = useTemplatePanel(t, callbacks);
  const { def, patch } = panel;
  const { name, setName, saveName, description, setDescription, saveDescription } = panel.fields;

  return (
    <Card className="admin-split__side ui-stack admin-template-panel" aria-label="Template details">
      <div className="ui-stack--8">
        <CategoryLabel>{CATEGORY_LABELS[t.category].one}</CategoryLabel>
        <input
          className="admin-detail-title admin-inline-edit"
          aria-label="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
        />
        <span className="ui-muted">
          {usageLabel(t)}
          {t.isVariant && ` · variant of the ${def?.name ?? t.layoutId} layout`}
        </span>
      </div>

      <div className="ui-stack--8">
        <span className="ui-label">Status on landing page</span>
        <Segmented<TemplateStatus>
          label="Status"
          value={t.status === "draft" ? "hidden" : t.status}
          onChange={(v) => void patch({ status: v }, "Landing page updated")}
          options={STATUS_OPTIONS}
        />
        <span className="ui-muted">Live shows “View live demo”. Coming soon shows “Notify me”. Hidden removes the card.</span>
        {t.status === "live" && !t.demoSlug && <Alert tone="warning">No published demo, so the card won&apos;t have a working “View live demo”.</Alert>}
        {t.status === "live" && !t.implemented && <Alert tone="warning">This template isn&apos;t built yet.</Alert>}
      </div>

      <Field label="Description" hint="Shown on the landing page card">
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} onBlur={saveDescription} />
      </Field>

      {t.isVariant && (
        <Field label="Category">
          <Select value={t.category} onChange={(e) => void patch({ category: e.target.value as TemplateCategory })}>
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c].one}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <TemplateCardEditor t={t} panel={panel} />

      {def ? (
        <TemplateDefaultsEditor def={def} panel={panel} />
      ) : (
        <Alert tone="info">This template is still in design. It can be listed as “Coming soon” but not used for events yet.</Alert>
      )}

      <TemplatePanelActions t={t} panel={panel} />
    </Card>
  );
}
