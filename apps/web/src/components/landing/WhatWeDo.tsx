import { useRef } from "react";
import { SectionHeading, Icon } from "@pokanito/ui";
import { featureMeta } from "@/content/landing";
import { useLang } from "./i18n";
import { useFlipCards } from "./what/useFlipCards";

/**
 * "What we do" (HANDOFF-ANIMATIONS B2): the three cards are dealt in face-down
 * and flip over as you scroll. The front face is the real content and is what
 * renders without JS or with reduced motion.
 */
export default function WhatWeDo() {
  const section = useRef<HTMLElement>(null);

  useFlipCards(section);

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
