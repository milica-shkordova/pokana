import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MEDIA } from "@pokanito/ui";
import { setupJourney } from "./setupJourney";

const DESKTOP = MEDIA.desktopMotion;
const MOBILE = MEDIA.mobileMotion;

/**
 * "How it works" (HowItWorks.tsx): runs the journey (setupJourney.ts) in
 * desktop or mobile mode; nothing with reduced motion.
 */
export function useJourney(section: RefObject<HTMLElement>) {
  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add({ desktop: DESKTOP, mobile: MOBILE }, (ctx) =>
        setupJourney(root, ctx.conditions?.desktop ? "desktop" : "mobile"),
      );
      return () => mm.revert();
    },
    { scope: section },
  );
}
