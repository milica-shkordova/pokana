import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ENV_SCALE, SEALED_CLASS } from "./constants";
import { INTRO_ARMED_CLASS } from "./introShared";
import { drawSeal, SEAL_END, SEAL_START } from "./sealBreak";
import { addBurst, addLogoFlight } from "./introTimeline";
import { driveIntro } from "./driveIntro";
import type { Els } from "./introElements";
import type { Mode } from "./types";

/**
 * Builds the B1 timeline (total duration 1, positions = progress of the pin,
 * copied from AnimHero.dc.html) plus its trigger. Runs inside a gsap.context,
 * so everything it sets is reverted with it. Returns a cleanup function.
 *
 * Every tween is a `fromTo` with `immediateRender: false` and the progress-0
 * state is set up front, so scrubbing backwards always restores cleanly.
 */
export function runIntro(els: Els, mode: Mode, onDone: () => void, onPassed?: () => void): () => void {
  const desktop = mode === "desktop";
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
  const ft = (
    target: gsap.TweenTarget,
    from: gsap.TweenVars,
    to: gsap.TweenVars,
    at: number,
    duration: number,
    ease?: string,
  ) => tl.fromTo(target, from, { ...to, duration, ...(ease ? { ease } : null), immediateRender: false }, at);

  // ── Sizes ────────────────────────────────────────────────────────────────
  // The stage is display:none until the intro runs; show it before measuring,
  // or it measures 0×0 and the envelope is scaled to nothing.
  gsap.set(els.stage, { display: "block", visibility: "visible" });
  const stageW = els.stage.clientWidth;
  const stageH = els.stage.clientHeight;
  const scale = desktop
    ? Math.min(ENV_SCALE, (0.9 * stageW) / 520, (0.5 * stageH) / 340) // room for heading + button
    : Math.min((0.9 * stageW) / 520, (0.42 * stageH) / 340); // B1 mobile: ~90% of the viewport width
  const sink = (150 * scale) / ENV_SCALE; // envelope sinks 150px at the design size
  const spread = gsap.utils.clamp(0.45, 1.2, stageW / 1440);

  const split = SplitText.create(els.words, { type: "words", tag: "span", aria: "none" });
  const words = split.words as HTMLElement[];

  // ── Progress-0 state ─────────────────────────────────────────────────────
  gsap.set(els.stage, { display: "block", visibility: "visible" });
  gsap.set(els.envScale, { scale });
  gsap.set(els.env, { y: 0 });
  gsap.set(els.hint, { opacity: 1 });
  // The sealed screen's heading, language switch and button.
  const screenUi = gsap.utils.toArray<HTMLElement>("[data-intro-ui]", els.pin);
  gsap.set(screenUi, { opacity: 1, pointerEvents: "auto" });
  // "Sealed": only the envelope screen shows (no header bar on phones).
  document.documentElement.classList.add(SEALED_CLASS);
  const sealParts = {
    body: els.sealBody,
    whole: els.sealWhole,
    left: els.sealL,
    right: els.sealR,
    crack: els.crack,
    crumbs: els.crumbs,
  };
  drawSeal(sealParts, 0);
  gsap.set(els.seal, { visibility: "visible" });
  gsap.set(els.flap, { rotationX: 0, transformOrigin: "50% 0%" });
  gsap.set(els.flapWrap, { zIndex: 3 });
  gsap.set(els.parts, { opacity: 1 });
  gsap.set(els.card, { y: 70, scale: 1, opacity: 0, zIndex: 1, transformOrigin: "50% 40%" });
  gsap.set([els.cardInner, els.cardLogo], { opacity: 1 });
  gsap.set([els.bg, els.dots, els.burst], { opacity: 0 });
  gsap.set(els.pill, { opacity: 0, y: 24 });
  gsap.set(els.words, { opacity: 1 });
  gsap.set(words, { opacity: 0, y: 40 });
  gsap.set(els.open, { opacity: 0, rotationX: 90, transformOrigin: "50% 100%" });
  gsap.set(els.dot, { opacity: 0 });
  gsap.set(els.underline, { strokeDashoffset: 100 });
  gsap.set([els.lede, els.actions], { opacity: 0, y: 24 });
  els.drops.forEach((d) => gsap.set(d, { opacity: 0, y: -520, rotation: 3 * Number(d.dataset.tilt ?? 0) }));
  gsap.set(els.poppers, { opacity: 0, scale: 0 });
  gsap.set(els.scroll, { opacity: 0 });
  gsap.set([els.slot, els.nav], { opacity: 0 });
  // Hidden links must not be clickable (keyboard focus still opens the intro).
  // The header logo waits (invisible) over the card until it flies, so it
  // must not catch clicks meant for the envelope.
  gsap.set([els.grid, els.scroll, els.nav, els.slot], { pointerEvents: "none" });
  // GSAP's inline styles now hold the sealed state; drop the pre-hydration CSS.
  document.documentElement.classList.remove(INTRO_ARMED_CLASS);

  // ── 0–0.34: seal cracks, flap opens ──────────────────────────────────────
  ft(els.hint, { opacity: 1 }, { opacity: 0 }, 0, 0.03, "none");
  ft(screenUi, { opacity: 1 }, { opacity: 0 }, 0, 0.04, "none");
  tl.set(screenUi, { pointerEvents: "none" }, 0.001);
  // The seal breaks (sealBreak.ts): crack, left half drops, right half hinges
  // and follows, crumbs scatter. One progress driver, the prototype formulas.
  const sealP = { p: SEAL_START };
  tl.fromTo(
    sealP,
    { p: SEAL_START },
    {
      p: SEAL_END,
      duration: SEAL_END - SEAL_START,
      ease: "none",
      immediateRender: false,
      onUpdate: () => drawSeal(sealParts, sealP.p),
    },
    SEAL_START,
  );
  tl.set(els.seal, { visibility: "hidden" }, SEAL_END);
  ft(els.flap, { rotationX: 0 }, { rotationX: 178 }, 0.16, 0.18);
  // Past 90° (io(t)·178 = 90 at ≈0.25) the flap drops behind the card.
  tl.set(els.flapWrap, { zIndex: 0, filter: "none" }, 0.25);

  // ── 0.26–0.66: card appears, slides out, grows into the background ──────
  ft(els.card, { opacity: 0 }, { opacity: 1 }, 0.26, 0.04, "none");
  ft(els.card, { y: 70 }, { y: -230 }, 0.32, 0.18);
  ft(els.env, { y: 0 }, { y: sink }, 0.32, 0.18);
  // In front of the pocket once fully out (0.97 of the slide ≈ 0.478).
  tl.set(els.card, { zIndex: 6 }, 0.478);
  ft(els.parts, { opacity: 1 }, { opacity: 0 }, 0.48, 0.12, "none");
  ft(els.cardInner, { opacity: 1 }, { opacity: 0 }, 0.5, 0.06, "none");
  ft(els.card, { scale: 1 }, { scale: 4.6 }, 0.5, 0.16);
  ft(els.card, { opacity: 1 }, { opacity: 0 }, 0.6, 0.06, "none");
  tl.set(els.stage, { visibility: "hidden" }, 0.7);

  // ── 0.42–0.78: confetti burst (radial spread + gravity + spin) ───────────
  addBurst(tl, ft, els, spread);

  // ── 0.50–0.62: the card logo becomes the header logo ─────────────────────
  tl.set(els.cardClip, { overflow: "visible" }, 0.49);
  tl.set(els.cardLogo, { opacity: 0 }, 0.5);
  // Desktop and mobile alike: the logo lifts off the card and flies home.
  addLogoFlight(tl, ft, els);
  ft(els.nav, { opacity: 0 }, { opacity: 1 }, 0.58, 0.04, "none");
  // Clickable only at the end: switching language while the headline is
  // split into words would desync React from the DOM.
  tl.set(els.nav, { pointerEvents: "auto" }, 1);

  // ── 0.60–1: the hero builds in ───────────────────────────────────────────
  ft([els.bg, els.dots], { opacity: 0 }, { opacity: 1 }, 0.6, 0.1, "none");
  ft(els.pill, { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, 0.62, 0.06);
  words.forEach((w, i) => ft(w, { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, 0.66 + i * 0.03, 0.06, "back.out(1.7)"));
  els.drops.forEach((d, i) => {
    const at = 0.72 + i * 0.04;
    const tilt = Number(d.dataset.tilt ?? 0);
    // Rotation settles from 4× the final tilt (the photo itself carries 1×).
    ft(d, { y: -520, rotation: 3 * tilt }, { y: 0, rotation: 0 }, at, 0.12, "back.out(1.7)");
    ft(d, { opacity: 0 }, { opacity: 1 }, at, 0.04, "none");
  });
  ft([els.open, els.dot], { opacity: 0, rotationX: 90 }, { opacity: 1, rotationX: 0 }, 0.86, 0.06);
  ft(els.underline, { strokeDashoffset: 100 }, { strokeDashoffset: 0 }, 0.84, 0.16, "sine.inOut");
  els.poppers.forEach((p, i) => {
    const at = 0.86 + i * 0.04;
    ft(p, { scale: 0 }, { scale: 1 }, at, 0.06, "back.out(2)");
    ft(p, { opacity: 0 }, { opacity: 1 }, at, 0.015, "none");
  });
  ft(els.lede, { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, 0.9, 0.05);
  tl.set([els.grid, els.scroll], { pointerEvents: "auto" }, 0.9);
  ft(els.actions, { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, 0.93, 0.05);
  ft(els.scroll, { opacity: 0 }, { opacity: 1 }, 0.95, 0.05, "none");
  tl.set({}, {}, 1); // total duration exactly 1

  // ── Drive it ─────────────────────────────────────────────────────────────
  // Click-to-open only (driveIntro.ts).
  const stop = driveIntro(tl, els, desktop, onDone, onPassed);

  return () => {
    stop();
    split.revert();
  };
}
