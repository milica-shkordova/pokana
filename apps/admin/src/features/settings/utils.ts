import type { MediaItem, PublicSettings, Settings } from "@pokanito/shared";
import { RSVP_DEADLINE_DAYS } from "./constants";

/** "Meat, Fish, Vegetarian" → ["Meat", "Fish", "Vegetarian"]. */
export const parseMenuText = (text: string) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const menuTextOf = (s: Settings) => s.defaultMenuOptions.join(", ");

/**
 * The admin settings only store the logo media id; the public settings
 * resolve it to an image URL. A freshly uploaded logo previews from upload.
 */
export const resolveLogoSrc = (form: Settings | null, uploaded: MediaItem | null, publicSettings: PublicSettings | undefined) =>
  !form?.logoMediaId ? null : uploaded?.id === form.logoMediaId ? uploaded.thumbUrl : (publicSettings?.logoUrl ?? null);

/** Deadline choices, including the stored value when it isn't a usual one. */
export const deadlineOptions = (current: number) => [...new Set([...RSVP_DEADLINE_DAYS, current])].sort((a, b) => a - b);
