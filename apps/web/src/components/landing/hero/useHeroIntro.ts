import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// "gsap/Flip" clashes with types/flip.d.ts on case-insensitive file systems
// (TS1149); gsap/all is side-effect free, so this still tree-shakes to Flip.
import { Flip } from "gsap/all";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { INTRO_FINISHED_EVENT } from "../useSmoothAnchors";
import { INTRO_ARMED_CLASS, readIntroSeen, writeIntroSeen } from "./introShared";
import { requestScrollRefresh } from "../scrollRefresh";
import { DESKTOP, FINE_POINTER, MOBILE, REDUCED } from "./constants";
import { collect } from "./introElements";
import { drawUnderline } from "./drawUnderline";
import { runIntro } from "./runIntro";
import { runPointerFx } from "./pointerFx";
import type { Mode } from "./types";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip, SplitText, useGSAP);

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
