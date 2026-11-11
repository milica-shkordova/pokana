/** Fired by the intro once the confetti burst has landed. */
export const CONFETTI_SETTLE_EVENT = "lp:confetti-settle";

const PAD = 32; // clear margin around the text block, px

/**
 * Hero confetti must never sit on the text. For every piece (the scattered
 * background pieces and the landed burst), measured from the live layout:
 * - over the headline / paragraph / buttons (plus a margin) → hidden;
 * - in the gap between the text and the photos → every second one hidden.
 * Pieces at the edges and around the photos stay. Hidden pieces fade out via
 * the `is-clear` class (CSS).
 */
export function keepConfettiClear(root: HTMLElement) {
  const copy = root.querySelector<HTMLElement>(".lp-hero__copy");
  const collage = root.querySelector<HTMLElement>(".lp-hero__collage");
  if (!copy) return;
  const c = copy.getBoundingClientRect();
  if (!c.width) return;
  const zone = { left: c.left - PAD, right: c.right + PAD, top: c.top - PAD, bottom: c.bottom + PAD };
  const g = collage?.getBoundingClientRect();
  // Side by side (desktop): the gap is the strip between text and photos.
  const gap = g && g.left > c.right ? { left: c.right, right: g.left } : null;

  // The "there's more" hint (bottom centre) is a clear zone too.
  const hint = root.querySelector<HTMLElement>(".lp-hero__more")?.getBoundingClientRect();
  const inHint = (x: number, y: number) =>
    !!hint && hint.width > 0 && x > hint.left - PAD && x < hint.right + PAD && y > hint.top - PAD && y < hint.bottom + PAD;

  const pieces = root.querySelectorAll<HTMLElement>(".lp-hero__speck, .lp-hero__burst-piece");
  let inGap = 0;
  pieces.forEach((p) => {
    const r = p.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    let hide = (x > zone.left && x < zone.right && y > zone.top && y < zone.bottom) || inHint(x, y);
    if (!hide && gap && x > gap.left && x < gap.right) hide = inGap++ % 2 === 0;
    p.classList.toggle("is-clear", hide);
  });
}
