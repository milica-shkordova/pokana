import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MEDIA } from "@pokanito/ui";
import { TILT } from "./constants";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * "What we do" (HANDOFF-ANIMATIONS B2): the `.lp-flip` cards in `section` are
 * dealt in face-down and flip over as you scroll (desktop: one timeline, once;
 * below 1024px: each card on its own).
 */
export function useFlipCards(section: RefObject<HTMLElement>) {
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".lp-flip");
      const inners = cards.map((c) => c.querySelector<HTMLElement>(".lp-flip__inner")!);
      const mm = gsap.matchMedia();

      mm.add(MEDIA.desktopMotion, () => {
        // Plays out on its own (not tied to scrolling) once the cards are in
        // view: ~3.2s, once. Positions below are fractions of that run.
        const tl = gsap.timeline({
          paused: true,
          scrollTrigger: {
            trigger: ".lp-features",
            start: "top 70%",
            toggleActions: "play none none none",
          },
        });
        // The cards are already on screen face-down (no deal-in), then flip
        // one after another. The section background stays cream.
        cards.forEach((card, i) => {
          const at = 0.1 + i * 0.25;
          tl.fromTo(inners[i], { rotateY: 180 }, { rotateY: 0, duration: 0.2, ease: "back.out(1.7)" }, at);
          tl.fromTo(card, { rotate: TILT[i] }, { rotate: 0, duration: 0.2, ease: "power2.inOut" }, at);
        });
        tl.to({}, { duration: 0.08 }, 0.92); // keep the timeline at length 1
        tl.timeScale(1 / 3.2);
      });

      mm.add(MEDIA.mobileMotion, () => {
        cards.forEach((card, i) => {
          gsap
            .timeline({ scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" } })
            .fromTo(card, { rotate: TILT[i] }, { rotate: 0, duration: 0.6, ease: "power2.out" })
            .fromTo(inners[i], { rotateY: 180 }, { rotateY: 0, duration: 0.7, ease: "back.out(1.7)" }, 0);
        });
      });

      return () => mm.revert();
    },
    { scope: section },
  );
}
