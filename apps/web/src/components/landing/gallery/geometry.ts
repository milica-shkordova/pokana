// Sideways template gallery (HANDOFF-ANIMATIONS B4): sizes and the maths that
// turns scroll progress into phone positions. Values from AnimTemplates.dc.html
// (designed on a 1440px-wide frame). All lengths are in unscaled stage px.

import { clamp } from "@pokanito/shared";

export const PHONE_W = 260;
export const PHONE_H = 530;
/** Centre-to-centre distance between phones. */
export const GAP = 330;
/** Phone screen (frame minus its 9px bezel). */
export const SCREEN_W = 242;
export const SCREEN_H = 512;
/** CSS width the demo page renders at inside a phone (a typical phone). */
export const FRAME_W = 390;
export const FRAME_SCALE = SCREEN_W / FRAME_W;
export const FRAME_H = Math.round(SCREEN_H / FRAME_SCALE);
/** How far the centred phone's invitation scrolls (screen px). */
export const INNER_SCROLL = 300;
/** Height the stage needs at scale 1: focused phone (530 × 1.1) + its label. */
export const STAGE_H = 620;
/** In the prototype the first phone starts 410px left of centre. */
const LEAD = 410;
const EDGE = 24;

export interface TrackGeometry {
  /** Centre x of the first visible phone at progress 0. */
  first: number;
  /** How far the row travels left over the whole pin. */
  travel: number;
}

/**
 * Long rows start with the first phone `LEAD` left of centre (so the row fills
 * the screen) and end with the last phone centred. Rows shorter than that start
 * centred and drift until the last phone is centred, so each phone still gets
 * the centre focus at some point. One phone: centred, no travel.
 */
export function trackGeometry(stageWidth: number, count: number): TrackGeometry {
  const span = Math.max(0, (count - 1) * GAP);
  const maxLead = Math.max(0, stageWidth / 2 - PHONE_W / 2 - EDGE);
  const lead = Math.min(LEAD, span / 2, maxLead);
  return { first: stageWidth / 2 - lead, travel: span - lead };
}

/** Centre focus for a phone `d` gaps away from the stage centre (+ = right). */
export function focusOf(d: number, hover: number) {
  const ad = Math.min(1, Math.abs(d));
  return {
    scale: 1.06 - 0.12 * ad + 0.04 * hover,
    rotation: clamp(-d * 6, -8, 8) * (1 - hover),
    /** Inner scroll in screen px. */
    scroll: (1 - ad) * INNER_SCROLL,
  };
}
