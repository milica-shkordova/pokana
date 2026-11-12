import { useMemo, useState } from "react";
import type { EventSummary, TemplateCategory } from "@pokanito/shared";
import { useDebouncedValue } from "@pokanito/ui";
import { useResource } from "@/lib/api";
import { SEARCH_DEBOUNCE_MS, TABS } from "./constants";
import type { Sort, Tab } from "./types";
import { countByTab } from "./utils";

/** Events list: search (debounced), category, sort and status tabs with counts. */
export function useEventsList() {
  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState<TemplateCategory | "">("");
  const [sort, setSort] = useState<Sort>("eventDate");
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS).trim();

  // Everything (archived too) in one request: the tabs filter here, so each
  // tab can show its count.
  const path = useMemo(() => {
    const p = new URLSearchParams({ sort, archived: "include" });
    if (category) p.set("category", category);
    if (debounced) p.set("q", debounced);
    return `/api/admin/events?${p}`;
  }, [category, sort, debounced]);
  const { data: all, loading, error, reload } = useResource<EventSummary[]>(path);
  const counts = useMemo(() => countByTab(all), [all]);
  const data = useMemo(
    () => all?.filter((e) => (tab === "all" ? e.status !== "archived" : e.status === tab)),
    [all, tab],
  );
  const tabItems = TABS.map((t) => ({ ...t, count: counts[t.value] }));

  return { tab, setTab, category, setCategory, sort, setSort, query, setQuery, debounced, data, loading, error, reload, counts, tabItems };
}
