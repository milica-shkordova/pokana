// ── Live preview ──
export const DESKTOP_WIDTH = 1280;
export const DESKTOP_HEIGHT = 820;
/** Desktop frame border (px each side). */
export const BEZEL = 6;
/** Match the .admin-device transitions in styles/_motion.scss. */
export const FADE_MS = 160;
export const MORPH_MS = 460;
/** Extra pause after fading back in before the device is idle again (ms). */
export const SETTLE_MS = 60;
/** Debounce for pushing edits into the preview iframe (ms). */
export const PREVIEW_PUSH_MS = 150;
/** Desktop scale until the column has been measured. */
export const INITIAL_DESKTOP_SCALE = 0.3;

// ── Editor ──
/** How often "Saved 2 min ago" re-renders (ms). */
export const SAVED_LABEL_TICK_MS = 30_000;
/** Pause before checking a typed slug's availability (ms). */
export const SLUG_CHECK_DELAY = 400;
/** Scroll-spy offset below the sticky editor header (px). */
export const PANE_SPY_OFFSET = 160;
export const SLUG_CHECKING = "Checking…";
/** Wait before re-fetching replies after a resend was queued (ms). */
export const RESEND_RELOAD_MS = 1500;
