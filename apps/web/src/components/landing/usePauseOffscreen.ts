import { useEffect, type RefObject } from "react";

/** Big blocks whose CSS animations (confetti drift, bobbing, line draws) can be paused. */
const BLOCKS = ".lp-hero, main > section, .lp-footer";

/**
 * Pauses every CSS animation inside a section while it is off screen
 * (`.lp-paused`, see _motion.scss). The page has ~80 looping animations
 * (hero confetti, the footer's falling drops…) that otherwise run, and need
 * their own compositor layers, all the time — the main cost while scrolling
 * on phones. GSAP and WAAPI animations are not affected.
 */
export function usePauseOffscreen(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const blocks = Array.from(el.querySelectorAll<HTMLElement>(BLOCKS));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("lp-paused", !e.isIntersecting)),
      // A little early, so loops are already moving as a section scrolls in.
      { rootMargin: "120px 0px" },
    );
    blocks.forEach((b) => io.observe(b));
    return () => {
      io.disconnect();
      blocks.forEach((b) => b.classList.remove("lp-paused"));
    };
  }, [root]);
}
