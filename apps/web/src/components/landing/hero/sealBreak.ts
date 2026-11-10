/**
 * The wax seal breaking (HANDOFF-SEAL, AnimHero.dc.html `sealL` / `sealR` /
 * `crack` / `crumbs`): pressure and tremble, a hairline crack drawing itself,
 * the left half dropping first with gravity, the right half hinging from its
 * top-right corner and falling a beat later, and nine wax crumbs popping out.
 *
 * `drawSeal(p)` maps the intro's progress (0–1, the same `p` as the rest of
 * the hero timeline) to every piece with the prototype's formulas, so the
 * motion is identical whether the timeline plays on a click or is scrubbed.
 * Distances are in envelope units (the envelope is scaled as a whole).
 */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const io = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
/** Fixed pseudo-random numbers, so the crumbs look the same every time. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const CRUMB_COLORS = ["#7A2A12", "#A3401C", "#D96A43"];

export const SEAL_CRUMBS = Array.from({ length: 9 }, (_, i) => ({
  vx: (rnd(i, 21) - 0.5) * 2, // −1…1 sideways
  up: 0.4 + rnd(i, 22) * 0.8, // initial upward kick
  size: +(3 + rnd(i, 23) * 4).toFixed(1), // 3–7px wide
  delay: rnd(i, 24) * 0.02, // in progress units
  startY: rnd(i, 25) * 50, // spread along the crack
  color: CRUMB_COLORS[i % 3],
}));

/** Where the break starts and when every piece has faded (progress units). */
export const SEAL_START = 0.06;
export const SEAL_END = 0.25;

export interface SealParts {
  /** Wraps the seal pieces: squeezes and trembles as one. */
  body: HTMLElement;
  /** The intact seal, shown until the crack has run through it. */
  whole: HTMLElement;
  left: HTMLElement;
  right: HTMLElement;
  crack: SVGSVGElement | HTMLElement;
  crumbs: HTMLElement[];
}

export function drawSeal(parts: SealParts, p: number) {
  const seg = (a: number, b: number) => clamp01((p - a) / (b - a));
  const crackT = seg(0.06, 0.09);
  const brk = seg(0.09, 0.2); // left half falls
  const brk2 = seg(0.115, 0.23); // right half falls a beat later
  const hinge = io(seg(0.09, 0.12)); // right half tips from its top-right corner
  const jit = crackT > 0 ? Math.sin(crackT * 42) * (1 - brk) * 2.6 : 0; // tremble
  const press = 1 - 0.035 * Math.sin(Math.PI * crackT) * (1 - brk); // squeeze

  const { body, whole, left, right, crack, crumbs } = parts;
  body.style.transform = `rotate(${jit.toFixed(2)}deg) scale(${press.toFixed(3)})`;
  // Intact until the crack reaches the bottom; the halves take over then (two
  // clipped copies side by side would show a hairline seam while sealed).
  const split = p >= 0.09;
  whole.style.opacity = split ? "0" : "1";
  // y: a tiny lift, then an accelerating (gravity) drop; x and rotation linear.
  left.style.transform =
    `translate(${(-26 * brk).toFixed(1)}px, ${(190 * brk * brk - 14 * brk).toFixed(1)}px) rotate(${(-80 * brk).toFixed(2)}deg)`;
  left.style.opacity = split ? (1 - seg(0.17, 0.22)).toFixed(3) : "0";
  right.style.transform =
    `translate(${(24 * brk2).toFixed(1)}px, ${(170 * brk2 * brk2).toFixed(1)}px) rotate(${(16 * hinge + 70 * brk2).toFixed(2)}deg)`;
  right.style.opacity = split ? (1 - seg(0.2, 0.25)).toFixed(3) : "0";

  // The crack draws (main line, then the side branches) and fades as the
  // split edges take over.
  crack.style.opacity = (crackT > 0 ? 1 - seg(0.095, 0.11) : 0).toFixed(3);
  const main = (1 - io(crackT)).toFixed(3);
  const branch = (1 - seg(0.075, 0.09)).toFixed(3);
  crack.querySelectorAll<SVGPathElement>(".lp-env__crack-main").forEach((el) => (el.style.strokeDashoffset = main));
  crack.querySelectorAll<SVGPathElement>(".lp-env__crack-branch").forEach((el) => (el.style.strokeDashoffset = branch));

  // Crumbs pop out of the crack and fall; they fade near the end.
  const fade = 1 - seg(0.16, 0.21);
  crumbs.forEach((el, i) => {
    const c = SEAL_CRUMBS[i];
    if (!c) return;
    const b = seg(0.09 + c.delay, 0.2);
    const x = 58 + c.vx * 70 * b;
    const y = 32 + c.startY - 60 * c.up * b + 220 * b * b;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(400 * c.vx * b).toFixed(0)}deg)`;
    el.style.opacity = (b > 0 ? fade : 0).toFixed(3);
  });
}
