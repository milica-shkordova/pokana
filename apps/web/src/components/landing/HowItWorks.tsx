import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionHeading, MEDIA } from "@pokanito/ui";
import { stepMeta } from "@/content/landing";
import { useLang } from "./i18n";
import { setupJourney } from "./journey/setupJourney";

const DESKTOP = MEDIA.desktopMotion;
const MOBILE = MEDIA.mobileMotion;

/**
 * "How it works" (HANDOFF-ANIMATIONS B3): a ribbon snakes through the three
 * step cards into a phone (step 4) while an envelope rides it, collecting a
 * template card, a name tag and a photo. Desktop pins and scrubs; below
 * 1024px it's a stacked column scrubbed without a pin. With reduced motion
 * it's the static card row. The step text is always plain DOM text; all the
 * decoration is aria-hidden. Layout lives in styles/landing/_journey.scss.
 */
export default function HowItWorks() {
  const section = useRef<HTMLElement>(null);

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

  const h = useLang().t.how;
  const steps = stepMeta.map((m, i) => ({ ...m, ...h.steps[i] }));

  return (
    <section id="how" ref={section} className="ui-section ui-section--linen lp-journey">
      <div className="lp-journey__stage">
        <div className="lp-wrap ui-stack--48 lp-journey__inner">
          <SectionHeading data-reveal eyebrow={h.eyebrow} title={h.title} />
          <div className="lp-journey__map">
            <svg className="lp-journey__svg" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="lp-journey-ribbon" className="lp-journey__grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" className="lp-journey__stop lp-journey__stop--a" />
                  <stop offset="0.5" className="lp-journey__stop lp-journey__stop--b" />
                  <stop offset="1" className="lp-journey__stop lp-journey__stop--c" />
                </linearGradient>
              </defs>
              <path className="lp-journey__guide" />
              <path className="lp-journey__ribbon" stroke="url(#lp-journey-ribbon)" />
              <path className="lp-journey__measure" />
            </svg>

            <ol className="lp-steps lp-journey__steps">
              {steps.map((s, i) => {
                const vars = { "--step-color": s.color, "--step-ink": s.ink } as CSSProperties;
                const num = <span className="lp-step__num">{i + 1}</span>;
                const copy = (
                  <div className="lp-journey__copy">
                    <b>{s.title}</b>
                    <span className="lp-step__text">{s.text}</span>
                  </div>
                );
                if (i < steps.length - 1) {
                  return (
                    <li key={i} className="lp-step" style={vars}>
                      {num}
                      {copy}
                    </li>
                  );
                }
                // Step 4 is the phone the envelope lands in.
                return (
                  <li key={i} className="lp-step lp-step--phone" style={vars}>
                    <div className="lp-journey__device">
                      <div className="lp-journey__screen">
                        {num}
                        {copy}
                        <span className="lp-journey__url" aria-hidden="true">
                          pokanito.mk/ana-marko
                        </span>
                      </div>
                    </div>
                    <div className="lp-journey__notif" aria-hidden="true">
                      <span className="lp-journey__app">M</span>
                      <span className="lp-journey__notif-copy">
                        <b>{h.notifTitle}</b>
                        <span>{h.notifText}</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="lp-journey__env" aria-hidden="true">
              <div className="lp-journey__letter">
                <span className="lp-journey__flap" />
                <span className="lp-journey__seal" />
                <span className="lp-journey__att lp-journey__att--card" />
                <span className="lp-journey__att lp-journey__att--tag">{h.tag}</span>
                <span className="lp-journey__att lp-journey__att--photo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
