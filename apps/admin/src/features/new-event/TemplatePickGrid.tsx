import { CATEGORY_LABELS, type TemplateSummary } from "@pokanito/shared";
import { CategoryLabel, Spinner, TemplateStatusBadge, cx, IconCheck } from "@pokanito/ui";
import PhoneThumb from "@/components/PhoneThumb";
import { thumbStyle } from "@/components/TemplateThumb";
import { pickUsage } from "./utils";

/** Templates as a listbox: click selects, double-click creates. */
export default function TemplatePickGrid({
  templates,
  pickedId,
  creating,
  onSelect,
  onCreate,
}: {
  templates: TemplateSummary[];
  pickedId: string | undefined;
  creating: string | null;
  onSelect: (id: string) => void;
  onCreate: (id: string) => void;
}) {
  return (
    <div className="admin-pick-grid" role="listbox" aria-label="Templates">
      {templates.map((t) => {
        const on = pickedId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="option"
            aria-selected={on}
            className={cx("admin-pick", on && "admin-pick--on")}
            onClick={() => onSelect(t.id)}
            onDoubleClick={() => onCreate(t.id)}
            disabled={!!creating}
          >
            <span className="admin-pick__thumb" style={{ background: thumbStyle(t).bg }}>
              <span className="admin-pick__badge">
                <TemplateStatusBadge status={t.status} size="sm" />
              </span>
              {on && (
                <span className="admin-pick__check" aria-hidden>
                  {creating === t.id ? <Spinner /> : <IconCheck />}
                </span>
              )}
              <PhoneThumb t={t} />
            </span>
            <span className="admin-pick__body">
              <CategoryLabel>{CATEGORY_LABELS[t.category].one}</CategoryLabel>
              <span className="admin-pick__name">{t.name}</span>
              <span className="admin-pick__desc">{t.description}</span>
              <span className="ui-muted admin-pick__usage">{pickUsage(t)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
