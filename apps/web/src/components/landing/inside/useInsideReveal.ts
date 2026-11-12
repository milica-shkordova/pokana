import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MEDIA } from "@pokanito/ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Cards rise in once, with a small stagger. */
export function useInsideReveal(section: RefObject<HTMLElement>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        gsap.from(".ic-card", {
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: ".ic-cards", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );
}
