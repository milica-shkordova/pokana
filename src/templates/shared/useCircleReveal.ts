import { useEffect, RefObject } from "react";
import gsap from "gsap";

// Plays once on mount: the element irises open from a point to fully
// visible. Used for circular hero photos, mirroring the wedding template's
// hero image clip-path reveal.
export function useCircleReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { clipPath: "circle(0% at 50% 50%)" });
    const tl = gsap.to(el, {
      clipPath: "circle(150% at 50% 50%)",
      ease: "power2.out",
      duration: 1.4,
      delay: 0.15,
    });
    return () => {
      tl.kill();
    };
  }, [ref]);
}
