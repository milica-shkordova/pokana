import { Wordmark } from "@pokanito/ui";
import { useLang } from "../i18n";
import { SEAL_CRUMBS } from "./sealBreak";

/**
 * The envelope of the hero intro (HANDOFF-ANIMATIONS B1, AnimHero.dc.html).
 * Laid out in "envelope units" (520×340); `.lp-env__scale` is scaled to the
 * viewport by the intro script. Everything here is decoration except the seal,
 * which is a button: clicking it auto-plays the intro.
 *
 * Only rendered visible while the intro runs (`.lp-hero__stage` is
 * `display: none` otherwise), so it never shows with reduced motion.
 */
export default function Envelope({ businessName, logoUrl }: { businessName: string; logoUrl?: string | null }) {
  const hero = useLang().t.hero;
  return (
    <div className="lp-env" data-intro="env">
      {/* The sealed "wants out" nudge (CSS only; GSAP never touches it). */}
      <div className="lp-env__nudge">
      <div className="lp-env__scale" data-intro="env-scale">
        <div className="lp-env__shadow" data-intro-part aria-hidden />
        <div className="lp-env__back" data-intro-part aria-hidden />
        <div className="lp-env__liner" data-intro-part aria-hidden />

        {/* Clips the card at the envelope's bottom edge until it is out. */}
        <div className="lp-env__card-clip" data-intro="card-clip" aria-hidden>
        <div className="lp-env__card" data-intro="card">
          <div className="lp-env__card-inner" data-intro="card-inner">
            <span className="lp-env__kicker">{hero.intro.kicker}</span>
            {/* The header logo flies out of this slot (Flip.fit), so it is the
                same image as the header's: the uploaded logo or <Wordmark />. */}
            <span className="lp-env__logo" data-intro="card-logo">
              {logoUrl ? (
                <img className="ui-wordmark ui-wordmark--lg" src={logoUrl} alt="" />
              ) : (
                <Wordmark size="lg" text="" />
              )}
            </span>
            <span className="lp-env__tagline">{hero.intro.tagline}</span>
          </div>
        </div>
        </div>

        <div className="lp-env__pocket" data-intro-part aria-hidden>
          <div className="lp-env__pocket-l" />
          <div className="lp-env__pocket-r" />
          <div className="lp-env__pocket-b-shadow">
            <div className="lp-env__pocket-b" />
          </div>
          {/* "SKOPJE" / "2026" in the stamp are placeholders (HANDOFF D1). */}
          <img className="lp-env__postmark" src="/brand/postmark.svg" alt="" width={210} height={120} />
        </div>

        <div className="lp-env__flap-wrap" data-intro="flap-wrap" data-intro-part aria-hidden>
          <div className="lp-env__flap" data-intro="flap">
            <div className="lp-env__flap-front" />
            <div className="lp-env__flap-back" />
          </div>
        </div>

        {/* Handwritten "Open me!" with an arrow that draws itself toward the
            seal. Fades away when the envelope is clicked. */}
        <div className="lp-env__note" data-intro="hint" aria-hidden>
          <span className="lp-env__note-text">{hero.intro.hint}</span>
          <svg className="lp-env__note-arrow" viewBox="0 0 80 70" fill="none">
            <path className="lp-env__note-line" pathLength={1} d="M50 6 C 54 22, 48 38, 30 48" />
            <path className="lp-env__note-head" pathLength={1} d="M42.0 48.2 L 30 48 L 36.2 37.7" />
          </svg>
        </div>

        <button
          type="button"
          className="lp-env__seal"
          data-intro="seal"
          aria-label={`${hero.intro.sealLabel} — ${businessName}`}
        >
          {/* Squeezes and trembles as a whole (sealBreak.ts). One intact seal
              until the crack has run through it, then the two halves. */}
          <span className="lp-env__seal-body" data-intro="seal-body" aria-hidden>
          <img className="lp-env__seal-whole" data-intro="seal-whole" src="/brand/wax-seal.svg" alt="" width={120} height={120} />
          <span className="lp-env__seal-half lp-env__seal-half--l" data-intro="seal-l" aria-hidden>
            <img src="/brand/wax-seal.svg" alt="" width={120} height={120} />
          </span>
          <span className="lp-env__seal-half lp-env__seal-half--r" data-intro="seal-r" aria-hidden>
            <img src="/brand/wax-seal.svg" alt="" width={120} height={120} />
          </span>
          {/* Hairline crack (HANDOFF-SEAL): drawn top to bottom, then two
              side cracks; the halves split along the same jagged line. */}
          <svg className="lp-env__crack" data-intro="crack" viewBox="0 0 120 120" aria-hidden>
            <path
              className="lp-env__crack-main"
              pathLength={1}
              d="M62 2 L57 18 L60 26 L55 37 L61 48 L65 60 L59 70 L57 82 L61 90 L56 100 L60 110 L62 119"
              stroke="#6A1E08"
              strokeWidth={1.3}
              opacity={0.55}
            />
            <path
              className="lp-env__crack-main"
              pathLength={1}
              d="M63.2 2 L58.2 18 L61.2 26 L56.2 37 L62.2 48 L66.2 60 L60.2 70 L58.2 82 L62.2 90 L57.2 100 L61.2 110 L63.2 119"
              stroke="#FFB48A"
              strokeWidth={0.6}
              opacity={0.4}
            />
            <path className="lp-env__crack-branch" pathLength={1} d="M61 48 L72 44 L80 46" stroke="#6A1E08" strokeWidth={0.8} opacity={0.45} />
            <path className="lp-env__crack-branch" pathLength={1} d="M57 82 L46 86 L40 84" stroke="#6A1E08" strokeWidth={0.8} opacity={0.45} />
          </svg>
          </span>
          {SEAL_CRUMBS.map((c, i) => (
            <span
              key={i}
              className="lp-env__crumb"
              data-intro="crumb"
              aria-hidden
              style={{ width: c.size, height: c.size * 0.8, background: c.color }}
            />
          ))}
        </button>
      </div>
      </div>
    </div>
  );
}
