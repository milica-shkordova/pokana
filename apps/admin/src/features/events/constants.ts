import type { Sort, Tab } from "./types";

export const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "in-review", label: "In review" },
  { value: "past", label: "Past" },
  { value: "archived", label: "Archived" },
];

export const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "eventDate", label: "Sort: event date" },
  { value: "updated", label: "Sort: last edited" },
  { value: "name", label: "Sort: name" },
];

/** Search box debounce (ms). */
export const SEARCH_DEBOUNCE_MS = 250;

/** Size of the downloadable QR code PNG (px). */
export const QR_SIZE = 1024;
