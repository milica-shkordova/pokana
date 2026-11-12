import { THUMB_TONES } from "@pokanito/ui";

// Admin-only formatting. Dates, sizes, durations and email lists live in
// @pokanito/shared (dates.ts / format.ts).

/** Placeholder thumbnail tone for an event without a photo (stable per key). */
export const toneFor = (key: string) => THUMB_TONES[[...key].reduce((a, c) => a + c.charCodeAt(0), 0) % THUMB_TONES.length];
