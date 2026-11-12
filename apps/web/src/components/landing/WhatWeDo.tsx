import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeading, Icon, MEDIA } from "@pokanito/ui";
import { featureMeta } from "@/content/landing";
import { useLang } from "./i18n";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TILT = [-4, 2, -2];

/**
 * "What we do" (HANDOFF-ANIMATIONS B2): the three cards are dealt in face-down
 * and flip over as you scroll. The front face is the real content and is what
 * renders without JS or with reduced motion.
 */
export default function WhatWeDo() {
  const section = useRef<HTMLElement>(null);

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

  const w = useLang().t.what;

  return (
    <section ref={section} id="what" className="ui-section ui-section--cream lp-what">
      <div className="lp-wrap ui-stack--40">
        {/* No scroll reveal here: in this pinned section the heading must
            always be visible while the cards flip. */}
        <SectionHeading
          eyebrow={w.eyebrow}
          title={
            <>
              {w.titleA}
              <br className="lp-br-wide" /> {w.titleB}
            </>
          }
          lede={w.lede}
        />
        <div className="lp-features">
          {featureMeta.map((m, i) => ({ ...m, ...w.features[i] })).map((f, i) => (
            <div className="lp-flip" key={i}>
              <div className="lp-flip__inner">
                <div className="lp-feature lp-flip__front" style={{ background: f.tone.bg }}>
                  <span className="lp-feature__icon" style={{ color: f.tone.fg }}>
                    <Icon name={f.icon} />
                  </span>
                  <h3 className="lp-feature__title">{f.title}</h3>
                  <p className="lp-feature__text">{f.text}</p>
                </div>
                <div className="lp-flip__back" aria-hidden>
                  <span className="lp-flip__dot lp-flip__dot--1" />
                  <span className="lp-flip__dot lp-flip__dot--2" />
                  <span className="lp-flip__dot lp-flip__dot--3" />
                  <span className="lp-flip__m">M</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
