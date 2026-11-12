import { CATEGORY_LABELS, type TemplateSummary } from "@pokanito/shared";
import { getDefinition } from "@pokanito/templates/definitions";
import { CategoryLabel, TemplateStatusBadge, cx } from "@pokanito/ui";
import TemplateThumb from "@/components/TemplateThumb";
import { usageLabel } from "./utils";

/** The template library as selectable cards. */
export default function TemplateGrid({
  items,
  selectedId,
  onSelect,
}: {
  items: TemplateSummary[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="admin-template-grid admin-template-grid--library">
      {items.map((t) => {
        const on = selectedId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            className={cx("admin-template-card", on && "admin-template-card--on")}
            onClick={() => onSelect(t.id)}
          >
            <TemplateThumb t={t}>
              <TemplateStatusBadge status={t.status} size="sm" />
            </TemplateThumb>
            <span className="admin-template-card__body">
              <CategoryLabel>{CATEGORY_LABELS[t.category].one}</CategoryLabel>
              <span className="admin-template-card__name">{t.name}</span>
              <span className="ui-muted">{t.isVariant ? `${usageLabel(t)} · variant of ${getDefinition(t.layoutId)?.name ?? t.layoutId}` : usageLabel(t)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
