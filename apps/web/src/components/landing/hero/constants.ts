import { CONFETTI_VARS, MEDIA } from "@pokanito/ui";
import { seededRandom as rnd } from "@pokanito/shared";

// ── Hero decoration ─────────────────────────────────────────────────────────

// Confetti around the envelope on the sealed screen (kept to the edges).
export const SEAL_CONFETTI = [
  { left: "9%", top: "18%", w: 18, h: 18, rot: 0, color: "var(--ui-color-marigold)" },
  { left: "24%", top: "25%", w: 34, h: 11, rot: 20, color: "var(--ui-color-coral)" },
  { left: "19%", top: "38%", w: 34, h: 11, rot: 30, color: "var(--ui-color-rose)" },
  { left: "7%", top: "62%", w: 30, h: 10, rot: -25, color: "var(--ui-color-sage)" },
  { left: "8%", top: "82%", w: 20, h: 20, rot: 0, color: "var(--ui-color-coral)" },
  { left: "15%", top: "84%", w: 14, h: 14, rot: 0, color: "var(--ui-color-terracotta)" },
  { left: "74%", top: "12%", w: 16, h: 16, rot: 0, color: "var(--ui-color-sage)" },
  { left: "88%", top: "20%", w: 38, h: 12, rot: -30, color: "var(--ui-color-marigold)" },
  { left: "92%", top: "47%", w: 14, h: 14, rot: 0, color: "var(--ui-color-rose)" },
  { left: "83%", top: "72%", w: 34, h: 11, rot: 35, color: "var(--ui-color-sage)" },
  { left: "91%", top: "86%", w: 20, h: 20, rot: 0, color: "var(--ui-color-marigold)" },
  { left: "74%", top: "90%", w: 32, h: 10, rot: -18, color: "var(--ui-color-rose)" },
];

// Extra background confetti for the hero (deterministic, so SSR and the
// browser agree). Kept off the middle band where the headline sits.
export const SPECKS = Array.from({ length: 26 }, (_, i) => {
  const strip = rnd(i, 21) > 0.55;
  const size = 7 + Math.round(rnd(i, 22) * 9);
  const side = i % 2 === 0;
  // Left side: the margin beside the copy, or the bands above/below it.
  const band = i % 4 === 0;
  return {
    left: side ? (band ? 12 + rnd(i, 23) * 28 : 1 + rnd(i, 23) * 9) : 58 + rnd(i, 24) * 40,
    top: side && band ? (rnd(i, 27) > 0.5 ? 4 + rnd(i, 25) * 14 : 86 + rnd(i, 25) * 9) : 4 + rnd(i, 25) * 90,
    w: strip ? size * 2.4 : size,
    h: strip ? Math.max(5, size * 0.7) : size,
    strip,
    rot: Math.round(rnd(i, 26) * 180 - 90),
    color: CONFETTI_VARS[i % CONFETTI_VARS.length],
  };
});

// ── Wax seal ───────────────────────────────────────────────────────────────

// Matched to the Pokanito wax (wax-seal.svg): ember, flame, highlight.
export const CRUMB_COLORS = ["#8A2A0C", "#C9461A", "#F07A40"];

/** The seal's hairline crack (Envelope.tsx): dark line and its light edge. */
export const CRACK_COLORS = { dark: "#6A1E08", light: "#FFB48A" };

// ── Intro (useHeroIntro.ts) ─────────────────────────────────────────────────

export const DESKTOP = MEDIA.desktopMotion;
export const MOBILE = MEDIA.mobileMotion;
export const REDUCED = MEDIA.reducedMotion;
export const FINE_POINTER = MEDIA.desktopFinePointerMotion;

/** Envelope scale at the 1440×900 design size (≈750×490 on screen). */
export const ENV_SCALE = 1.45;
/** Mobile: the whole (shortened) timeline auto-plays in this many seconds. */
/** How long the click-to-open animation runs. */
export const DESKTOP_SECONDS = 7;
/** On <html> while the envelope waits to be opened. */
export const SEALED_CLASS = "lp-sealed";
/** On <html> while the opening plays (envelope-only look kept until done). */
export const OPENING_CLASS = "lp-opening";
export const MOBILE_SECONDS = 5;
