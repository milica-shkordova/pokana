import { useRef } from "react";
import { cx } from "@pokanito/ui";
import { useLang } from "./i18n";
import CountdownCard from "./inside/CountdownCard";
import RsvpCard from "./inside/RsvpCard";
import DirectionsCard from "./inside/DirectionsCard";
import LanguageCard from "./inside/LanguageCard";
import { useCarouselIndex } from "./inside/useCarouselIndex";
import { useInsideReveal } from "./inside/useInsideReveal";

/**
 * "Inside every invitation" (HANDOFF-INSIDE-CARDS): four tinted cards that
 * actually work, so visitors try the countdown, RSVP, directions and language
 * switch the way a guest would. All state is local; nothing is sent anywhere.
 * Desktop: 4 in a row · tablet: 2 × 2 · phone: snap carousel with dots.
 */
export default function Inside() {
  const { t, lang } = useLang();
  const c = t.inside;
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Phone carousel: the dot follows the card closest to the start.
  const active = useCarouselIndex(track);

  // Cards rise in once, with a small stagger.
  useInsideReveal(section);

  return (
    <section ref={section} id="inside" className="ic">
      <div className="ic__inner">
        <div className="ic__head">
          <div className="ic__copy" data-reveal>
            <span className="ui-eyebrow ic__eyebrow">{c.eyebrow}</span>
            <h2 className="ic__title">{c.title}</h2>
            <p className="ic__intro">{c.intro}</p>
          </div>
          <div className="ic__note" aria-hidden>
            <span>{c.note}</span>
            <svg viewBox="0 0 60 70" width="60" height="70" fill="none">
              <path className="ic__note-line" pathLength={100} d="M8 6 C 40 10, 52 34, 40 62" />
              <path className="ic__note-head" pathLength={100} d="M30 54 L 40 64 L 48 52" />
            </svg>
          </div>
        </div>

        <div className="ic-cards" ref={track} role="region" aria-label={c.carouselLabel}>
          <CountdownCard c={c} />
          <RsvpCard c={c} />
          <DirectionsCard c={c} />
          <LanguageCard c={c} pageLang={lang} />
        </div>

        <div className="ic-dots" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cx("ic-dots__dot", active === i && "ic-dots__dot--on")} />
          ))}
        </div>
      </div>
    </section>
  );
}
