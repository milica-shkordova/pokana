import gsap from "gsap";

/**
 * The wavy underline under "open" draws itself when the headline comes into
 * view, and again when you scroll back up to it. `drawn`: it is already on
 * screen fully drawn (just after the intro), so only re-entries redraw it.
 */
export function drawUnderline(path: SVGPathElement, drawn = false) {
  const tween = gsap.fromTo(
    path,
    { strokeDashoffset: 100 },
    {
      strokeDashoffset: 0,
      duration: 1.1,
      ease: "power2.inOut",
      delay: drawn ? 0 : 0.3,
      paused: drawn,
      scrollTrigger: {
        trigger: path,
        start: "top 90%",
        toggleActions: drawn ? "none none none none" : "play none none none",
        onEnterBack: () => tween.restart(true),
      },
    },
  );
  if (drawn) tween.progress(1);
  return tween;
}
