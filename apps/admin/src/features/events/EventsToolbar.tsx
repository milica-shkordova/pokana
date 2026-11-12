import { CATEGORY_LABELS, TEMPLATE_CATEGORIES, type TemplateCategory } from "@pokanito/shared";
import { Select, Tabs } from "@pokanito/ui";
import { SORT_OPTIONS } from "./constants";
import type { Sort, Tab } from "./types";

/** Status tabs, event type filter and sort above the events table. */
export default function EventsToolbar({
  tabItems,
  tab,
  onTab,
  archivedCount,
  category,
  onCategory,
  sort,
  onSort,
}: {
  tabItems: { value: Tab; label: string; count: number }[];
  tab: Tab;
  onTab: (t: Tab) => void;
  archivedCount: number;
  category: TemplateCategory | "";
  onCategory: (c: TemplateCategory | "") => void;
  sort: Sort;
  onSort: (s: Sort) => void;
}) {
  return (
    <div className="admin-table-toolbar">
      <Tabs sliding items={tabItems} value={tab} onChange={onTab} aria-label="Filter events" />
      <div className="ui-row">
        {tab === "all" && archivedCount > 0 && <span className="ui-muted admin-table-hint">Archived events are hidden here</span>}
        <label>
          <span className="ui-sr-only">Event type</span>
          <Select size="sm" value={category} onChange={(e) => onCategory(e.target.value as TemplateCategory | "")}>
            <option value="">All event types</option>
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c].many}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="ui-sr-only">Sort</span>
          <Select size="sm" value={sort} onChange={(e) => onSort(e.target.value as Sort)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </label>
      </div>
    </div>
  );
}
