import { ButtonLink, Heading, Lede } from "@pokanito/ui";
import { useLang } from "../i18n";

/** The hero's text block: pill, headline, lede and the two magnetic buttons. */
export default function HeroCopy() {
  const { t, lang } = useLang();
  const hero = t.hero;
  return (
    <div className="lp-hero__copy">
      <span className="lp-hero__pill" data-intro="pill">
        <span className="lp-hero__pill-dot" aria-hidden />
        {hero.eyebrow}
      </span>
      <Heading level={1} size="display" className="lp-hero__title" id="lp-hero-title">
        {/* Keyed by language: the intro splits this into words, so a
            language switch swaps in a fresh element (useHeroIntro). */}
        <span className="lp-hero__words" data-intro="words" key={lang}>
          {hero.titleStart}
        </span>
        <span className="lp-hero__pop" data-intro="open">
          {hero.titlePop}
          <svg className="lp-hero__underline" viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden>
            <path
              data-intro="underline"
              pathLength={100}
              d="M2 7 Q 12 0 22 7 T 42 7 T 62 7 T 82 7 T 102 7 T 118 7"
            />
          </svg>
        </span>
        <span className="lp-hero__dot" data-intro="dot">
          .
        </span>
      </Heading>
      <Lede className="lp-hero__lede" data-intro="lede">
        {hero.lede}
      </Lede>
      <div className="lp-hero__actions" data-intro="actions">
        <span className="lp-hero__mag" data-magnetic>
          <ButtonLink href="#templates" size="lg">
            {hero.browse}
          </ButtonLink>
        </span>
        <span className="lp-hero__mag" data-magnetic>
          <ButtonLink href="#contact" size="lg" variant="secondary" className="lp-hero__ghost">
            {hero.contact}
          </ButtonLink>
        </span>
      </div>
    </div>
  );
}
