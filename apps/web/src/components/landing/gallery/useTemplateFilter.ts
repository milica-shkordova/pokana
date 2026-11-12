import { useMemo, useState } from "react";
import { TEMPLATE_CATEGORIES, type TemplateSummary } from "@pokanito/shared";
import { useLang } from "../i18n";
import type { Filter } from "./types";

/** The gallery tabs, the active filter and the live / coming-soon templates it shows. */
export function useTemplateFilter(templates: TemplateSummary[]) {
  const [filter, setFilter] = useState<Filter>("all");
  const tt = useLang().t.templates;
  const CATEGORY_LABELS = tt.categories;
  const TABS: { value: Filter; label: string }[] = [
    { value: "all", label: tt.all },
    ...TEMPLATE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c].many })),
  ];

  const live = useMemo(() => templates.filter((t) => t.status === "live" && t.demoSlug), [templates]);
  const soon = useMemo(() => templates.filter((t) => t.status === "coming-soon"), [templates]);
  const match = (t: TemplateSummary) => filter === "all" || t.category === filter;
  const visibleLive = live.filter(match);
  const visibleSoon = soon.filter(match);
  const liveKey = live.map((t) => t.id).join("|");

  return { filter, setFilter, tt, CATEGORY_LABELS, TABS, live, soon, match, visibleLive, visibleSoon, liveKey };
}
