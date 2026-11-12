import { CATEGORY_LABELS, TEMPLATE_CATEGORIES, type TemplateSummary } from "@pokanito/shared";
import type { TemplateDefinition } from "@pokanito/templates/definitions";
import type { Cat } from "./types";

export const usageLabel = (t: TemplateSummary) =>
  !t.implemented ? "In design" : t.usageCount ? `Used in ${t.usageCount} event${t.usageCount === 1 ? "" : "s"}` : "No events yet";

/** Category chips with counts ("All" first, every category even when empty). */
export const categoryTabs = (list: TemplateSummary[]) => [
  { value: "all" as Cat, label: "All", count: list.length },
  ...TEMPLATE_CATEGORIES.map((c) => ({ value: c as Cat, label: CATEGORY_LABELS[c].one, count: list.filter((t) => t.category === c).length })),
];

/** A layout's default colours, keyed by theme option. */
export const defaultTheme = (def: TemplateDefinition | undefined): Record<string, string> =>
  def ? Object.fromEntries(def.themeOptions.map((o) => [o.key, o.default])) : {};
