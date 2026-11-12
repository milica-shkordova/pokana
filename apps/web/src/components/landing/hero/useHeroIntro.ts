import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// "gsap/Flip" clashes with types/flip.d.ts on case-insensitive file systems
// (TS1149); gsap/all is side-effect free, so this still tree-shakes to Flip.
import { Flip } from "gsap/all";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { MEDIA } from "@pokanito/ui";
import { INTRO_FINISHED_EVENT } from "../useSmoothAnchors";
import { CONFETTI_SETTLE_EVENT } from "./confettiZone";
import { lockScroll } from "../scrollLock";
import { BURST, INTRO_ARMED_CLASS, readIntroSeen, writeIntroSeen } from "./introShared";
import { requestScrollRefresh } from "../scrollRefresh";
import { drawSeal, SEAL_END, SEAL_START } from "./sealBreak";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip, SplitText, useGSAP);

const DESKTOP = MEDIA.desktopMotion;
const MOBILE = MEDIA.mobileMotion;
const REDUCED = MEDIA.reducedMotion;
const FINE_POINTER = MEDIA.desktopFinePointerMotion;

/** Envelope scale at the 1440×900 design size (≈750×490 on screen). */
const ENV_SCALE = 1.45;
/** Mobile: the whole (shortened) timeline auto-plays in this many seconds. */
/** How long the click-to-open animation runs. */
const DESKTOP_SECONDS = 7;
/** On <html> while the envelope waits to be opened. */
const SEALED_CLASS = "lp-sealed";
/** On <html> while the opening plays (envelope-only look kept until done). */
const OPENING_CLASS = "lp-opening";
const MOBILE_SECONDS = 5;

type Mode = "desktop" | "mobile";

function collect(root: HTMLElement) {
  const one = (name: string) => root.querySelector<HTMLElement>(`[data-intro="${name}"]`);
  const all = (name: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-intro="${name}"]`));
  const slot = root.querySelector<HTMLElement>("[data-header-logo]");
  const nav = root.querySelector<HTMLElement>("[data-header-nav]");
  const els = {
    pin: one("pin"),
    stage: one("stage"),
    env: one("env"),
    envScale: one("env-scale"),
    hint: one("hint"),
    seal: one("seal"),
    sealL: one("seal-l"),
    sealR: one("seal-r"),
    crack: one("crack"),
    sealBody: one("seal-body"),
    sealWhole: one("seal-whole"),
    flap: one("flap"),
    flapWrap: one("flap-wrap"),
    card: one("card"),
    cardClip: one("card-clip"),
    cardInner: one("card-inner"),
    cardLogo: one("card-logo"),
    bg: one("bg"),
    dots: one("dots"),
    burst: one("burst"),
    grid: one("grid"),
    pill: one("pill"),
    words: one("words"),
    open: one("open"),
    dot: one("dot"),
    underline: root.querySelector<SVGPathElement>('[data-intro="underline"]'),
    lede: one("lede"),
    actions: one("actions"),
    scroll: one("scroll"),
    slot,
    slotImg: (slot?.firstElementChild as HTMLElement | null) ?? null,
    nav,
  };
  for (const v of Object.values(els)) if (!v) return null;
  return {
    ...(els as { [K in keyof typeof els]: NonNullable<(typeof els)[K]> }),
    parts: Array.from(root.querySelectorAll<HTMLElement>("[data-intro-part]")),
    drops: all("drop"),
    crumbs: all("crumb"),
    poppers: all("popper"),
    burstPieces: Array.from(els.burst!.children) as HTMLElement[],
  };
}

type Els = NonNullable<ReturnType<typeof collect>>;

/**
 * Builds the B1 timeline (total duration 1, positions = progress of the pin,
 * copied from AnimHero.dc.html) plus its trigger. Runs inside a gsap.context,
 * so everything it sets is reverted with it. Returns a cleanup function.
 *
 * Every tween is a `fromTo` with `immediateRender: false` and the progress-0
 * state is set up front, so scrubbing backwards always restores cleanly.
 */
/**
 * The wavy underline under "open" draws itself when the headline comes into
 * view, and again when you scroll back up to it. `drawn`: it is already on
 * screen fully drawn (just after the intro), so only re-entries redraw it.
 */
function drawUnderline(path: SVGPathElement, drawn = false) {
  const tween = gsap.fromTo(
    path,
    { strokeDashoffset: 100 },
    {
      strokeDashoffset: 0,
      duration: 1.1,
      ease: "power2.inOut",
      delay: drawn ? 0 : 0.3,
      paused: drawn,
      scrollTrigger: {
        trigger: path,
        start: "top 90%",
        toggleActions: drawn ? "none none none none" : "play none none none",
        onEnterBack: () => tween.restart(true),
      },
    },
  );
  if (drawn) tween.progress(1);
  return tween;
}

function runIntro(els: Els, mode: Mode, onDone: () => void, onPassed?: () => void): () => void {
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

  // ── 0.50–0.62: the card logo becomes the header logo ─────────────────────
  tl.set(els.cardClip, { overflow: "visible" }, 0.49);
  tl.set(els.cardLogo, { opacity: 0 }, 0.5);
  // Desktop and mobile alike: the logo lifts off the card and flies home.
  {
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
  // Click-to-open only: no pin, no scroll scrubbing. The page waits on the
  // sealed envelope (scrolling paused); a click plays the whole opening at a
  // fixed pace, then hands over to the plain finished hero.
  tl.set(els.slot, { pointerEvents: "auto" }, 0.62); // landed in the header
  tl.pause(0);
  tl.timeScale(1 / (desktop ? DESKTOP_SECONDS : MOBILE_SECONDS));

  // Page scrolling is locked until the opening has played out. The lock
  // keeps the scrollbar, so the page never shifts when it ends.
  let release: (() => void) | null = lockScroll();
  const unlock = () => {
    release?.();
    release = null;
  };
  tl.eventCallback("onComplete", () => {
    document.documentElement.classList.remove(OPENING_CLASS);
    unlock();
    onDone();
    onPassed?.();
  });
  // On open: the shake stops and the envelope eases straight (0.45s, CSS
  // transition), then the flap opens. Until the opening has played out the
  // page keeps its envelope-only look (OPENING_CLASS).
  let opening = false;
  const open = () => {
    if (opening || tl.progress() >= 1) return;
    opening = true;
    const html = document.documentElement;
    // Ease the nudging envelope straight from wherever it is right now.
    const nudge = els.env.querySelector<HTMLElement>(".lp-env__nudge");
    const from = nudge ? getComputedStyle(nudge).transform : "none";
    html.classList.add(OPENING_CLASS);
    html.classList.remove(SEALED_CLASS);
    if (nudge && from !== "none") {
      nudge.animate([{ transform: from }, { transform: "none" }], {
        duration: 450,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
    gsap.delayedCall(0.45, () => tl.play());
  };

  const onSeal = (e: Event) => {
    e.preventDefault();
    open();
  };
  // A keyboard user tabbing into the (still hidden) nav or buttons gets the
  // open hero. Mouse clicks (no :focus-visible) and the seal itself don't.
  const onFocus = (e: FocusEvent) => {
    const t = e.target as Element | null;
    if (!t || els.seal.contains(t) || t.closest("[data-intro-ui]") || !t.matches(":focus-visible")) return;
    if (tl.progress() < 1) open();
  };
  // Clicking anywhere on the envelope (the seal is its keyboard-focusable
  // button) opens it.
  els.env.addEventListener("click", onSeal);
  const openBtn = els.pin.querySelector<HTMLElement>("[data-intro-open]");
  openBtn?.addEventListener("click", onSeal);
  els.pin.addEventListener("focusin", onFocus);

  return () => {
    els.env.removeEventListener("click", onSeal);
    openBtn?.removeEventListener("click", onSeal);
    document.documentElement.classList.remove(SEALED_CLASS, OPENING_CLASS);
    unlock();
    els.pin.removeEventListener("focusin", onFocus);
    split.revert();
  };
}

/** B8 in the hero: magnetic CTAs and mouse parallax (fine pointer only). */
function runPointerFx(root: HTMLElement): () => void {
  const hero = root.querySelector<HTMLElement>(".lp-hero");
  if (!hero) return () => undefined;

  const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-par]")).map((el) => {
    const depth = Number(el.dataset.par) || 0;
    const vars = { duration: 0.8, ease: "power3.out" };
    return { depth, x: gsap.quickTo(el, "x", vars), y: gsap.quickTo(el, "y", vars) };
  });
  const onMove = (e: MouseEvent) => {
    const r = hero.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    // Polaroids ±16–24px, stickers ±18px, confetti the other way ±10px.
    layers.forEach((l) => {
      l.x(mx * l.depth);
      l.y(my * l.depth * 0.65);
    });
  };
  const onLeaveHero = () => layers.forEach((l) => (l.x(0), l.y(0)));
  hero.addEventListener("mousemove", onMove);
  hero.addEventListener("mouseleave", onLeaveHero);

  // Magnetic buttons: up to ~13px x / ~9px y towards the pointer. The wrapper
  // moves, so the button's own CSS hover transform is untouched.
  const mags = Array.from(root.querySelectorAll<HTMLElement>("[data-magnetic]"));
  const magMove = (e: MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    gsap.to(el, {
      x: ((e.clientX - r.left) / r.width - 0.5) * 26,
      y: ((e.clientY - r.top) / r.height - 0.5) * 18,
      duration: 0.3,
      ease: "power3.out",
      overwrite: true,
    });
  };
  const magLeave = (e: MouseEvent) => {
    gsap.to(e.currentTarget as HTMLElement, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
  };
  mags.forEach((m) => {
    m.addEventListener("mousemove", magMove);
    m.addEventListener("mouseleave", magLeave);
  });

  return () => {
    hero.removeEventListener("mousemove", onMove);
    hero.removeEventListener("mouseleave", onLeaveHero);
    mags.forEach((m) => {
      m.removeEventListener("mousemove", magMove);
      m.removeEventListener("mouseleave", magLeave);
    });
    gsap.killTweensOf(mags);
    gsap.set(mags, { clearProps: "transform" });
  };
}

/**
 * The hero intro (HANDOFF-ANIMATIONS B1) + hero pointer effects (B8).
 *
 * - Desktop: pinned + scrubbed (`+=250%`), logo flies into the header (Flip).
 * - Mobile (<1024px): no pin, a shortened version auto-plays (~1.8s), no Flip.
 * - Reduced motion, or already seen this session: the static hero.
 */
export function useHeroIntro(scope: RefObject<HTMLDivElement>, ready = true, lang = "en") {
  // Read once per page view; a resize/breakpoint change must not flip modes
  // because the intro just finished and wrote the flag.
  const seenAtLoad = useRef<boolean | null>(null);
  const done = useRef(false);

  useGSAP(
    () => {
      // Wait until the saved language is restored: the intro splits the
      // headline into words, so its text must be final first (see i18n.tsx).
      if (!ready) return;
      const root = scope.current;
      const html = document.documentElement;
      const disarm = () => html.classList.remove(INTRO_ARMED_CLASS);
      const els = root ? collect(root) : null;
      if (!root || !els) {
        disarm();
        return;
      }
      if (seenAtLoad.current === null) seenAtLoad.current = readIntroSeen();
      const markDone = () => {
        if (done.current) return;
        done.current = true;
        writeIntroSeen();
      };

      const mm = gsap.matchMedia();
      mm.add({ desktop: DESKTOP, mobile: MOBILE, reduced: REDUCED }, (self) => {
        const { desktop, mobile } = self.conditions as Record<string, boolean>;
        if ((!desktop && !mobile) || seenAtLoad.current || done.current) {
          disarm(); // static hero
          if (desktop || mobile) drawUnderline(els.underline);
          return;
        }
        const mode: Mode = desktop ? "desktop" : "mobile";
        let cancelled = false;
        // Once the user has scrolled past the opened envelope, the intro is
        // done for good: swap in the plain finished hero (no pin) and shift the
        // scroll position by the pin length removed, so nothing visibly jumps.
        // Scrolling back up then ends at the hero, never the envelope.
        let finished = false;
        const finish = () => {
          if (finished || cancelled) return;
          finished = true;
          requestAnimationFrame(() => {
            const spacer = els.pin.parentElement;
            const removed =
              spacer?.classList.contains("pin-spacer") ? spacer.offsetHeight - els.pin.offsetHeight : 0;
            const y = window.scrollY;
            // Keep the confetti from the burst where it landed: remember each
            // piece before the intro is undone, then put it back.
            const burstOpacity = getComputedStyle(els.burst).opacity;
            const pieces = els.burstPieces.map((p) => p.style.transform);
            ctx.revert();
            disarm();
            els.burst.style.opacity = burstOpacity;
            // From now on it is background confetti: behind the text, and
            // fainter on phones (see .lp-hero__burst.is-settled).
            els.burst.classList.add("is-settled");
            els.burstPieces.forEach((p, i) => {
              p.style.transform = pieces[i];
            });
            // Registered with the matchMedia context so it is cleaned up too.
            self.add(() => drawUnderline(els.underline, true));
            window.scrollTo(0, Math.max(0, y - removed));
            ScrollTrigger.refresh();
            // Lets an in-flight anchor scroll re-aim (useSmoothAnchors).
            window.dispatchEvent(new Event(INTRO_FINISHED_EVENT));
          });
        };
        let ctx = gsap.context(() => runIntro(els, mode, markDone, finish));
        if (mode === "mobile") return () => ctx.revert();

        // Flip.fit and the envelope scale are measured at build time, so the
        // desktop intro is rebuilt when the viewport changes, and once the
        // logos and fonts have loaded if they weren't ready the first time.
        const rebuild = () => {
          if (cancelled || finished) return;
          ctx.revert();
          ctx = gsap.context(() => runIntro(els, mode, markDone, finish));
          requestScrollRefresh();
        };
        const logos = [els.slotImg, els.cardLogo.querySelector("img")].filter(
          (n): n is HTMLImageElement => n instanceof HTMLImageElement,
        );
        const ready = logos.every((i) => i.complete && i.naturalWidth > 0) && document.fonts?.status !== "loading";
        if (!ready) {
          Promise.all([...logos.map((i) => i.decode().catch(() => undefined)), document.fonts?.ready]).then(rebuild, rebuild);
        }
        let size = `${window.innerWidth}x${window.innerHeight}`;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const onResize = () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            const next = `${window.innerWidth}x${window.innerHeight}`;
            if (next === size) return;
            size = next;
            rebuild();
          }, 250);
        };
        window.addEventListener("resize", onResize);

        return () => {
          cancelled = true;
          clearTimeout(timer);
          window.removeEventListener("resize", onResize);
          ctx.revert();
        };
      });

      mm.add(FINE_POINTER, () => runPointerFx(root));

      // Pins measure layout and fonts can shift it after first paint
      // (ScrollTrigger refreshes on window load by itself).
      document.fonts?.ready.then(requestScrollRefresh).catch(() => undefined);

      return () => {
        mm.revert();
        disarm();
      };
    },
    // Rebuilt on a language switch (only possible on the sealed screen or
    // after the opening), so the split headline always has the right words.
    // revertOnUpdate: undo the previous run first, or the new run would
    // record the sealed state as the page's original styles.
    { scope, dependencies: [ready, lang], revertOnUpdate: true },
  );
}
