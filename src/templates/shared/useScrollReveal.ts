import { useEffect, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Scroll-driven reveal wiring shared by the birthday/corporate/christening
// templates, mirroring the patterns hand-written per-selector in the wedding
// template's index.tsx. Mark elements with a data attribute instead of
// listing selectors here, so new sections opt in without touching this file:
//
//   data-reveal        simple fade-up, plays once when scrolled into view
//   data-reveal-scale  fade + scale, scrubbed to scroll position
//                       (mirrors the wedding template's "Welcome" section)
//   data-reveal-group  wraps a list; each data-reveal-item child fades in
//                       staggered, scrubbed to scroll position (mirrors the
//                       wedding template's countdown/timeline stagger)
export function useScrollReveal(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      gsap.utils.toArray<Element>("[data-reveal]", container).forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils.toArray<Element>("[data-reveal-scale]", container).forEach((el) => {
        gsap.set(el, { opacity: 0, scale: 1.04 });
        gsap.to(el, {
          opacity: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "top 55%",
            scrub: 1,
          },
        });
      });

      gsap.utils.toArray<Element>("[data-reveal-group]", container).forEach((group) => {
        const children = group.querySelectorAll("[data-reveal-item]");
        if (!children.length) return;
        gsap.set(children, { opacity: 0, y: 24 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: group,
            start: "top 80%",
            end: "top 30%",
            scrub: 1,
          },
        });
        children.forEach((child, i) => {
          tl.to(child, { opacity: 1, y: 0, ease: "none", duration: 0.4 }, i * 0.25);
        });
      });
    }, container);

    return () => ctx.revert();
  }, [containerRef]);
}
