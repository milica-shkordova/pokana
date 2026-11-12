import gsap from "gsap";
import { CONFETTI_SETTLE_EVENT } from "./confettiZone";
import { BURST } from "./introShared";
import type { Els } from "./introElements";

/** `fromTo` on the intro timeline at `at` (progress units), see runIntro.ts. */
export type Ft = (
  target: gsap.TweenTarget,
  from: gsap.TweenVars,
  to: gsap.TweenVars,
  at: number,
  duration: number,
  ease?: string,
) => gsap.core.Timeline;

/** 0.42–0.78: confetti burst (radial spread + gravity + spin). */
export function addBurst(tl: gsap.core.Timeline, ft: Ft, els: Els, spread: number) {
  const setters = els.burstPieces.map((el) => ({
    x: gsap.quickSetter(el, "x", "px"),
    y: gsap.quickSetter(el, "y", "px"),
    r: gsap.quickSetter(el, "rotation", "deg"),
  }));
  const burst = { b: 0 };
  const drawBurst = () => {
    const b = burst.b;
    const sb = Math.sqrt(b);
    BURST.forEach((p, i) => {
      const s = setters[i];
      if (!s) return;
      s.x(Math.cos(p.angle) * p.speed * spread * sb);
      s.y(Math.sin(p.angle) * p.speed * spread * sb * 0.75 + 380 * spread * b * b);
      s.r(p.spin0 + b * 400);
    });
  };
  drawBurst();
  tl.fromTo(burst, { b: 0 }, { b: 1, duration: 0.36, ease: "none", immediateRender: false, onUpdate: drawBurst }, 0.42);
  ft(els.burst, { opacity: 0 }, { opacity: 1 }, 0.42, 0.005, "none");
  // Once the burst has landed it becomes background confetti: it moves behind
  // the text and fades smoothly to 30% so the copy stays readable (the same
  // end state .lp-hero__burst.is-settled keeps after the intro).
  tl.set(els.burst, { zIndex: 1 }, 0.8);
  // Clear confetti off the text as it settles (Hero.tsx / confettiZone.ts).
  tl.call(
    () => {
      window.dispatchEvent(new Event(CONFETTI_SETTLE_EVENT));
    },
    undefined,
    0.8,
  );
  ft(els.burst, { opacity: 1 }, { opacity: 0.3 }, 0.78, 0.16, "power1.inOut");
}

/** 0.50–0.62: the card logo lifts off the card and flies into the header. */
export function addLogoFlight(tl: gsap.core.Timeline, ft: Ft, els: Els) {
  tl.set(els.slot, { opacity: 1 }, 0.5);
  // The header logo starts exactly on top of the card logo and flies home.
  // Its start offset is measured live when the flight begins (where the card
  // logo really is on screen at 0.5), not precomputed, so scrub lag, fonts
  // and resizes can never make it start in the wrong place.
  gsap.set(els.slot, { x: 0, y: 0, scale: 1, transformOrigin: "50% 50%" });
  const fly = { t: 0 };
  let from: { x: number; y: number; s: number } | null = null;
  const ease = gsap.parseEase("power2.inOut");
  const measure = () => {
    gsap.set(els.slot, { x: 0, y: 0, scale: 1 });
    const a = els.cardLogo.getBoundingClientRect();
    const b = els.slot.getBoundingClientRect();
    if (!a.width || !b.width) return;
    from = {
      x: a.left + a.width / 2 - (b.left + b.width / 2),
      y: a.top + a.height / 2 - (b.top + b.height / 2),
      s: a.width / b.width,
    };
  };
  const renderFly = () => {
    if (!from) measure();
    if (!from) return;
    const k = ease(fly.t);
    gsap.set(els.slot, { x: from.x * (1 - k), y: from.y * (1 - k), scale: from.s + (1 - from.s) * k });
  };
  tl.fromTo(
    fly,
    { t: 0 },
    {
      t: 1,
      duration: 0.12,
      ease: "none",
      immediateRender: false,
      onStart: () => {
        measure();
        renderFly();
      },
      onUpdate: renderFly,
    },
    0.5,
  );
  // The arc: lift ~50px and tilt up to −4° mid-flight.
  ft(els.slotImg, { y: 0, rotation: 0 }, { y: -32, rotation: -4 }, 0.5, 0.06, "sine.out");
  ft(els.slotImg, { y: -32, rotation: -4 }, { y: 0, rotation: 0 }, 0.56, 0.06, "sine.in");
}
