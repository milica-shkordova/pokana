import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@pokanito/ui";
import { requestScrollRefresh } from "./scrollRefresh";

const GROUP = "[data-reveal-group]";

/**
 * Light scroll reveals for the landing page (HANDOFF-ANIMATIONS B6 + B10):
 * - every `[data-reveal]` element fades up 24px over 0.6s;
 * - `[data-reveal]` items inside a `[data-reveal-group]` (pricing plans, FAQ,
 *   …) do the same with a 0.08s stagger;
 * - `[data-reveal-after]` inside a group (the "Most chosen" sticker) fades in
 *   with a small scale once the group has landed.
 * They play at "top 80%" and reverse when scrolled back above.
 *
 * Sections with their own choreography (hero, cards, journey, gallery,
 * inside, footer) don't use these attributes.
 *
 * Content is visible in the server HTML; GSAP only hides it once it runs, so
 * nothing stays invisible without JS. Reduced motion skips all of it.
 */
export function useLandingReveal(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const toggleActions = "play none none reverse";

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(GROUP, el).forEach((group) => {
        const items = Array.from(group.children).filter((c) => c.hasAttribute("data-reveal"));
        const after = group.querySelectorAll("[data-reveal-after]");
        if (!items.length) return;
        const tl = gsap.timeline({ scrollTrigger: { trigger: group, start: "top 80%", toggleActions } });
        tl.fromTo(
          items,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, clearProps: "transform" },
        );
        if (after.length) {
          tl.fromTo(after, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, "-=0.1");
        }
      });

      gsap.utils
        .toArray<HTMLElement>("[data-reveal]", el)
        .filter((n) => !n.parentElement?.closest(GROUP))
        .forEach((n) => {
          gsap.fromTo(
            n,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              clearProps: "transform",
              scrollTrigger: { trigger: n, start: "top 80%", toggleActions },
            },
          );
        });
    }, el);

    // Fonts shift the layout after first paint: re-measure then (one shared,
    // coalesced refresh; ScrollTrigger handles window load itself).
    document.fonts?.ready.then(requestScrollRefresh).catch(() => undefined);

    return () => {
      ctx.revert();
    };
  }, [root]);
}
