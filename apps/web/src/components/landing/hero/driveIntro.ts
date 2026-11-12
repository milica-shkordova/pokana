import gsap from "gsap";
import { lockScroll } from "@pokanito/ui";
import { DESKTOP_SECONDS, MOBILE_SECONDS, OPENING_CLASS, SEALED_CLASS } from "./constants";
import type { Els } from "./introElements";

/**
 * Drives the built intro timeline (runIntro.ts): click-to-open only, no pin,
 * no scroll scrubbing. The page waits on the sealed envelope (scrolling
 * paused); a click plays the whole opening at a fixed pace, then hands over
 * to the plain finished hero. Returns the cleanup.
 */
export function driveIntro(
  tl: gsap.core.Timeline,
  els: Els,
  desktop: boolean,
  onDone: () => void,
  onPassed?: () => void,
): () => void {
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
  };
}
