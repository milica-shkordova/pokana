import type { EventStatus, EventSummary } from "@pokanito/shared";

/** Status tab of the events list. */
export type Tab = "all" | Extract<EventStatus, "live" | "draft" | "in-review" | "past" | "archived">;

export type Sort = "eventDate" | "updated" | "name";

/** What the events list is asking to confirm (null = nothing open). */
export type EventAction =
  | { kind: "unpublish"; event: EventSummary }
  | { kind: "archive"; event: EventSummary }
  | { kind: "delete"; event: EventSummary }
  | null;

/** Runs an API call, then toasts `done` and refreshes the list (or toasts the error). */
export type RunAction = (fn: () => Promise<unknown>, done: string) => Promise<void>;
