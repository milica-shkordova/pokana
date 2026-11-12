import type { TemplateStatus } from "@pokanito/shared";

/** Autosave delay for palette / section edits on the defaults event (ms). */
export const DEFAULTS_SAVE_DELAY = 400;

/** Landing page status choices ("draft" shows as Hidden). */
export const STATUS_OPTIONS: { value: TemplateStatus; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "coming-soon", label: "Coming soon" },
  { value: "hidden", label: "Hidden" },
];
