import type { Locale, MediaItem, MediaKind, SectionKind } from "@pokanito/shared";

/** A card in the editor column (and its item in the section nav). */
export type Pane = "basics" | "photos" | "theme" | "client" | "replies" | SectionKind;

/** Section nav dot: done, needs info, or switched off. */
export type DotTone = "ok" | "warn" | "off";

export type Device = "phone" | "desktop";

/** Phone ↔ desktop switch: fade out, morph the frame, fade back in. */
export type MorphPhase = "idle" | "out" | "morph" | "in";

/** Language select: one locale, or both with a toggle. */
export type LangChoice = Locale | "both";

/** Result of the live slug check (null = unchanged from the saved slug). */
export type SlugState = { ok: boolean; msg: string } | null;

/** An open media picker: what to pick and where the choice goes. */
export interface PickerRequest {
  kind: MediaKind;
  onPick: (m: MediaItem) => void;
  title?: string;
}

/** The public site's preview links for an event. */
export interface PreviewUrls {
  url: string;
  embedUrl: string;
}
