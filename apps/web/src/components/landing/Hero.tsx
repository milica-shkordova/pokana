import { useRef } from "react";
import { LangToggle, useLang } from "./i18n";
import Envelope from "./hero/Envelope";
import HeroCopy from "./hero/HeroCopy";
import Collage from "./hero/Collage";
import { HeroBurst, HeroDots, SealConfetti } from "./hero/Decor";
import { INTRO_ARM_SCRIPT } from "./hero/introShared";
import { useHeroIntro } from "./hero/useHeroIntro";
import { useConfettiClearZone } from "./hero/useConfettiClearZone";
import type { HeroProps } from "./hero/types";

/**
 * Hero (Landing.dc.html) + the envelope intro (HANDOFF-ANIMATIONS B1) and the
 * hero's magnetic buttons / mouse parallax (B8).
 *
 * The page header is rendered inside the pinned frame (`header` prop) because
 * the intro flies the card's logo into it and fades its nav in.
 *
 * The server HTML is the finished, static hero: that's what reduced motion,
 * repeat visits (sessionStorage) and no-JS get. The intro only hides things
 * once it runs (plus the pre-hydration `lp-intro-armed` class, see
 * introShared.ts). Text and buttons are hidden with opacity only, never
 * `display: none`, so they stay readable for assistive tech.
 */
export default function Hero({ header, businessName, logoUrl }: HeroProps) {
  const root = useRef<HTMLDivElement>(null);
  const { t, ready, lang } = useLang();
  const hero = t.hero;
  useHeroIntro(root, ready, lang);

  // Keep confetti off the text (hero/useConfettiClearZone.ts).
  useConfettiClearZone(root, lang);

  return (
    <div className="lp-intro" ref={root}>
      {/* Must run before first paint; see introShared.ts. */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_ARM_SCRIPT }} />
      {/* The pinned element. ScrollTrigger wraps it in a pin-spacer, so it is
          a child of the React-owned `.lp-intro`, not the ref'd node itself. */}
      <div className="lp-intro__pin" data-intro="pin">
        {header}
        {/* Language switch for the sealed-envelope screen, top corner. */}
        <div className="lp-seal-screen__lang" data-intro-ui>
          <LangToggle />
        </div>
        <section className="lp-hero" aria-labelledby="lp-hero-title">
          <div className="lp-hero__bg" data-intro="bg" aria-hidden />

          {/* Confetti decorations (Landing.dc.html). */}
          <HeroDots />

          <div className="lp-hero__stage" data-intro="stage">
            {/* The sealed-envelope screen: everything marked data-intro-ui
                fades away as soon as the opening starts. */}
            <SealConfetti />
            <div className="lp-seal-screen__head" data-intro-ui>
              <span className="lp-seal-screen__brand">{businessName}</span>
              <p className="lp-seal-screen__title">{hero.intro.title}</p>
            </div>
            <Envelope businessName={businessName} logoUrl={logoUrl} />
            <button type="button" className="lp-seal-btn" data-intro-ui data-intro-open>
              <img className="lp-seal-btn__seal" src="/brand/wax-seal.svg" alt="" width={44} height={44} />
              <span>{hero.intro.button}</span>
            </button>
          </div>

          <div className="lp-wrap lp-hero__grid" data-intro="grid">
            <HeroCopy />

            {/* Photos and stickers (parallax › intro drop › CSS tilt). */}
            <Collage />

          </div>

          {/* Scroll hint: handwritten note + a squiggly arrow that keeps
              redrawing itself. Links to the next section. */}
          <a href="#what" className="lp-hero__more" data-intro="scroll" data-cursor="">
            <span className="lp-hero__more-text">{hero.scroll}</span>
            <svg className="lp-hero__more-arrow" viewBox="0 0 40 100" fill="none" aria-hidden>
              <path
                className="lp-hero__more-line"
                pathLength={100}
                d="M20 2 C 34 14, 6 26, 20 38 C 34 50, 6 62, 20 74 L 20 92"
              />
              <path className="lp-hero__more-head" pathLength={100} d="M10 82 L 20 94 L 30 82" />
            </svg>
          </a>

          <HeroBurst />

        </section>
      </div>
    </div>
  );
}
