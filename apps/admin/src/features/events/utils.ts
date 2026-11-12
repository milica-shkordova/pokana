import type { EventSummary } from "@pokanito/shared";
import type { Tab } from "./types";

/** Per-tab counts; "all" leaves archived events out. */
export function countByTab(events: EventSummary[] | undefined): Record<Tab, number> {
  const c: Record<Tab, number> = { all: 0, live: 0, draft: 0, "in-review": 0, past: 0, archived: 0 };
  for (const e of events ?? []) {
    if (e.status in c) c[e.status as Tab]++;
    if (e.status !== "archived") c.all++;
  }
  return c;
}

/** RSVPs column: attending / expected, attending alone, or a dash. */
export const rsvpCell = (e: EventSummary) =>
  e.rsvpCount === 0 && !e.expectedGuests ? "—" : e.expectedGuests ? `${e.attendingGuests} / ${e.expectedGuests}` : e.attendingGuests;

/** Empty-table title for the current filters. */
export const emptyTitle = (tab: Tab, query: string, category: string) =>
  tab === "archived" && !query && !category ? "Nothing archived" : query || tab !== "all" || category ? "Nothing matches" : "No events yet";
