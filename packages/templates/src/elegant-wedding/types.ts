import type { RefObject } from "react";

/** Elements of the hero the intro animation (useElegantIntro) moves. */
export interface HeroRefs {
  heroRef: RefObject<HTMLElement>;
  heroTextRef: RefObject<HTMLDivElement>;
  heroImgWrapRef: RefObject<HTMLDivElement>;
}
