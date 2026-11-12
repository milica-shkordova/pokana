import { CATEGORY_LABELS, TEMPLATE_CATEGORIES, type Lead, type TemplateSummary } from "@pokanito/shared";
import type { Cat } from "@/features/templates/types";

/** Templates an event can be created from (built, and not hidden). */
export const usableTemplates = (list: TemplateSummary[]) => list.filter((t) => t.implemented && t.status !== "hidden");

/** Matches the category chip and the search text (name + description). */
export const matchesFilter = (t: TemplateSummary, cat: Cat, q: string) =>
  (cat === "all" || t.category === cat) && (!q || `${t.name} ${t.description}`.toLowerCase().includes(q));

/** Category chips with counts, only for categories that have a usable template. */
export const categoryTabs = (usable: TemplateSummary[]) => [
  { value: "all" as Cat, label: "All", count: usable.length },
  ...TEMPLATE_CATEGORIES.filter((c) => usable.some((t) => t.category === c)).map((c) => ({
    value: c as Cat,
    label: CATEGORY_LABELS[c].many,
    count: usable.filter((t) => t.category === c).length,
  })),
];

/** A lead asking about a template that has no event yet. */
export const suggestLead = (leads: Lead[] | undefined, usable: TemplateSummary[]) =>
  leads?.find((l) => l.templateId && !l.eventId && l.stage !== "lost" && usable.some((t) => t.id === l.templateId));

export const pickUsage = (t: TemplateSummary) => (t.usageCount > 0 ? `Used in ${t.usageCount} event${t.usageCount === 1 ? "" : "s"}` : "New");
