import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MEDIA } from "@pokanito/ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Footer finale (HANDOFF-ANIMATIONS A4 + B9): the mark pops, the name rises
 * letter by letter, the tagline fades in, and confetti rains (`is-raining`
 * on `root`) while the footer is on screen.
 */
export function useFooterFinale(root: RefObject<HTMLElement>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        const letters = gsap.utils.toArray<HTMLElement>(".lp-finale__char");
        // Plays (not scrubbed) once the name itself is well into view, so it
        // never finishes before you can see it. Reverses when scrolled back up.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".lp-finale__word", start: "top 75%", toggleActions: "play none none reverse" },
        });
        tl.fromTo(
          ".lp-finale__mark",
          { opacity: 0, y: 80, scale: 0.6, rotate: -10 },
          { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.7)" },
          0,
        );
        letters.forEach((ch, i) => {
          tl.fromTo(
            ch,
            { opacity: 0, y: 160, rotate: i % 2 ? 8 : -8 },
            { opacity: 1, y: 0, rotate: 0, duration: 0.7, ease: "back.out(1.7)" },
            0.3 + i * 0.08,
          );
        });
        tl.fromTo(".lp-finale__tag, .lp-finale__ig", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "none" }, ">-0.2");

        // Confetti rain only runs while the footer is on screen.
        ScrollTrigger.create({
          trigger: ".lp-finale",
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => root.current?.classList.toggle("is-raining", self.isActive),
        });
        return () => root.current?.classList.remove("is-raining");
      });
      return () => mm.revert();
    },
    { scope: root },
  );
}
