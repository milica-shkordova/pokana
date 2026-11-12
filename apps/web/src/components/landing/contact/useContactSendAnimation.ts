import type { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@pokanito/ui";

gsap.registerPlugin(useGSAP);

/**
 * The contact form's send animations (HANDOFF-ANIMATIONS B7), scoped to `box`
 * (`.lp-send`): `flyAway` folds the form into an envelope that flies off with
 * a confetti burst, `shake` shakes the send button, `reset(onIdle)` brings
 * the form back (calling `onIdle` where the form returns to idle).
 */
export function useContactSendAnimation(box: RefObject<HTMLDivElement>) {
  const { contextSafe } = useGSAP({ scope: box });

  const flyAway = contextSafe(() => {
    const el = box.current!;
    const form = el.querySelector<HTMLElement>(".lp-contact__form")!;
    const env = el.querySelector<HTMLElement>(".lp-send__envelope")!;
    const done = el.querySelector<HTMLElement>(".lp-send__done")!;
    const pieces = gsap.utils.toArray<HTMLElement>(".lp-send__piece", el);

    if (prefersReducedMotion()) {
      gsap.set(form, { autoAlpha: 0 });
      gsap.set(done, { autoAlpha: 1 });
      done.querySelector("button")?.focus();
      return;
    }

    // The envelope starts as the form's box and folds down to 260×170.
    const sx = form.offsetWidth / 260;
    const sy = form.offsetHeight / 170;
    gsap
      .timeline({ onComplete: () => done.querySelector("button")?.focus() })
      // 0–0.5s: fields fade and shrink, the box becomes an envelope.
      .to(form, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: "power2.in" }, 0)
      .fromTo(env, { autoAlpha: 0, scaleX: sx, scaleY: sy }, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: 0.5, ease: "power2.inOut" }, 0)
      .fromTo(".lp-send__flap", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.25)
      .fromTo(".lp-send__seal", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, 0.35)
      // 0.55–1.35s: it flies off to the top right with a confetti burst.
      .to(env, { x: 520, y: -620, rotate: 28, scale: 0.6, duration: 0.8, ease: "power2.in" }, 0.55)
      .set(pieces, { opacity: 1, x: 0, y: 0 }, 0.55)
      .to(
        pieces,
        {
          x: () => gsap.utils.random(-260, 260),
          y: () => gsap.utils.random(-220, 200),
          rotate: () => gsap.utils.random(-400, 400),
          duration: 0.9,
          ease: "expo.out",
        },
        0.55,
      )
      .to(pieces, { opacity: 0, duration: 0.5, stagger: 0.01 }, 1.05)
      .set(env, { autoAlpha: 0 }, 1.4)
      // ~1.5s: "Message sent!" pops in.
      .fromTo(done, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, 1.5);
  });

  const shake = contextSafe(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      ".lp-contact__actions .ui-button",
      { x: 0 },
      { keyframes: { x: [0, -10, 9, -7, 5, -2, 0] }, duration: 0.5, ease: "none" },
    );
  });

  const reset = contextSafe((onIdle: () => void) => {
    const el = box.current!;
    gsap.set([".lp-send__envelope", ".lp-send__done"], { clearProps: "all" });
    gsap.set(".lp-send__piece", { clearProps: "all" });
    gsap.fromTo(
      ".lp-contact__form",
      { autoAlpha: 0, scale: 0.96 },
      { autoAlpha: 1, scale: 1, duration: prefersReducedMotion() ? 0 : 0.4, ease: "power2.out", clearProps: "all" },
    );
    onIdle();
    el.querySelector<HTMLInputElement>(".lp-contact__form input")?.focus();
  });

  return { flyAway, shake, reset };
}
