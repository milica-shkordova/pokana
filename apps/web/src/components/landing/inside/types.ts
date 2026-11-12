import type { Copy } from "@/content/landing";

export type InsideCopy = Copy["inside"];

/** Countdown to the sample date, split into units. */
export interface CountdownParts {
  days: number;
  hours: number;
  min: number;
  sec: number;
}
