import { useEffect, useRef, type ReactNode } from "react";
import { ButtonLink, Heading, Lede } from "@pokanito/ui";
import { LangToggle, useLang } from "./i18n";
import { CONFETTI_SETTLE_EVENT, keepConfettiClear } from "./hero/confettiZone";
import Envelope from "./hero/Envelope";
import { BURST, INTRO_ARM_SCRIPT, rnd } from "./hero/introShared";

// Extra background confetti for the hero (deterministic, so SSR and the
// browser agree). Kept off the middle band where the headline sits.
const SPECK_COLORS = ["var(--ui-color-coral)", "var(--ui-color-marigold)", "var(--ui-color-rose)", "var(--ui-color-sage)", "var(--ui-color-terracotta)"];
// Confetti around the envelope on the sealed screen (kept to the edges).
const SEAL_CONFETTI = [
  { left: "9%", top: "18%", w: 18, h: 18, rot: 0, color: "var(--ui-color-marigold)" },
  { left: "24%", top: "25%", w: 34, h: 11, rot: 20, color: "var(--ui-color-coral)" },
  { left: "19%", top: "38%", w: 34, h: 11, rot: 30, color: "var(--ui-color-rose)" },
  { left: "7%", top: "62%", w: 30, h: 10, rot: -25, color: "var(--ui-color-sage)" },
  { left: "8%", top: "82%", w: 20, h: 20, rot: 0, color: "var(--ui-color-coral)" },
  { left: "15%", top: "84%", w: 14, h: 14, rot: 0, color: "var(--ui-color-terracotta)" },
  { left: "74%", top: "12%", w: 16, h: 16, rot: 0, color: "var(--ui-color-sage)" },
  { left: "88%", top: "20%", w: 38, h: 12, rot: -30, color: "var(--ui-color-marigold)" },
  { left: "92%", top: "47%", w: 14, h: 14, rot: 0, color: "var(--ui-color-rose)" },
  { left: "83%", top: "72%", w: 34, h: 11, rot: 35, color: "var(--ui-color-sage)" },
  { left: "91%", top: "86%", w: 20, h: 20, rot: 0, color: "var(--ui-color-marigold)" },
  { left: "74%", top: "90%", w: 32, h: 10, rot: -18, color: "var(--ui-color-rose)" },
];

const SPECKS = Array.from({ length: 26 }, (_, i) => {
  const strip = rnd(i, 21) > 0.55;
  const size = 7 + Math.round(rnd(i, 22) * 9);
  const side = i % 2 === 0;
  // Left side: the margin beside the copy, or the bands above/below it.
  const band = i % 4 === 0;
  return {
    left: side ? (band ? 12 + rnd(i, 23) * 28 : 1 + rnd(i, 23) * 9) : 58 + rnd(i, 24) * 40,
    top: side && band ? (rnd(i, 27) > 0.5 ? 4 + rnd(i, 25) * 14 : 86 + rnd(i, 25) * 9) : 4 + rnd(i, 25) * 90,
    w: strip ? size * 2.4 : size,
    h: strip ? Math.max(5, size * 0.7) : size,
    strip,
    rot: Math.round(rnd(i, 26) * 180 - 90),
    color: SPECK_COLORS[i % SPECK_COLORS.length],
  };
});
import { useHeroIntro } from "./hero/useHeroIntro";

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
export default function Hero({
  header,
  businessName,
  logoUrl,
}: {
  header: ReactNode;
  businessName: string;
  logoUrl?: string | null;
}) {
  const root = useRef<HTMLDivElement>(null);
  const { t, ready, lang } = useLang();
  const hero = t.hero;
  useHeroIntro(root, ready, lang);

  // Keep confetti off the text: hide pieces over the headline / paragraph /
  // buttons and thin out the gap between text and photos. Re-applied when the
  // burst lands and whenever the layout changes size (language, viewport).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const apply = () => keepConfettiClear(el);
    apply();
    const ro = new ResizeObserver(apply);
    const copy = el.querySelector(".lp-hero__copy");
    if (copy) ro.observe(copy);
    ro.observe(el);
    window.addEventListener(CONFETTI_SETTLE_EVENT, apply);
    return () => {
      ro.disconnect();
      window.removeEventListener(CONFETTI_SETTLE_EVENT, apply);
    };
  }, [lang]);

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
          <div className="lp-hero__dots" data-intro="dots" data-par="-10" aria-hidden>
            <span className="lp-hero__confetti lp-hero__confetti--1" />
            <span className="lp-hero__confetti lp-hero__confetti--2" />
            <span className="lp-hero__confetti lp-hero__confetti--3" />
            <span className="lp-hero__confetti lp-hero__confetti--4" />
            <span className="lp-hero__confetti lp-hero__confetti--5" />
            {SPECKS.map((p, i) => (
              <span
                key={i}
                className="lp-hero__speck"
                style={{
                  left: `${p.left.toFixed(1)}%`,
                  top: `${p.top.toFixed(1)}%`,
                  width: p.w,
                  height: p.h,
                  borderRadius: p.strip ? 6 : "50%",
                  background: p.color,
                  transform: `rotate(${p.rot}deg)`,
                }}
              />
            ))}
          </div>

          <div className="lp-hero__stage" data-intro="stage">
            {/* The sealed-envelope screen: everything marked data-intro-ui
                fades away as soon as the opening starts. */}
            <div className="lp-seal-screen__confetti" data-intro-ui aria-hidden>
              {SEAL_CONFETTI.map((c, i) => (
                <span
                  key={i}
                  style={{
                    left: c.left,
                    top: c.top,
                    width: c.w,
                    height: c.h,
                    borderRadius: c.h === c.w ? "50%" : 6,
                    background: c.color,
                    rotate: `${c.rot}deg`,
                  }}
                />
              ))}
            </div>
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

            {/* Each piece: positioned item (mouse parallax) › drop/pop wrapper
                (intro) › the visual (CSS tilt, hover, bob). Keeping the three
                transforms on separate elements stops them fighting. */}
            <div className="lp-hero__collage" aria-hidden>
              <div className="lp-hero__item lp-hero__item--one" data-par="16">
                <div className="lp-hero__drop" data-intro="drop" data-tilt="4">
                  <div className="lp-hero__photo lp-hero__photo--one">
                    <img src="/assets/1.jpg" alt="" />
                  </div>
                </div>
              </div>
              <div className="lp-hero__item lp-hero__item--two" data-par="24">
                <div className="lp-hero__drop" data-intro="drop" data-tilt="-5">
                  <div className="lp-hero__photo lp-hero__photo--two">
                    <img src="/assets/2.jpg" alt="" />
                  </div>
                </div>
              </div>
              <div className="lp-hero__item lp-hero__item--rsvp" data-par="18">
                <span className="lp-hero__popper" data-intro="popper">
                  <span className="lp-hero__sticker lp-hero__sticker--rsvp">{hero.stickerRsvp}</span>
                </span>
              </div>
              <div className="lp-hero__item lp-hero__item--days" data-par="18">
                <span className="lp-hero__popper" data-intro="popper">
                  <span className="lp-hero__sticker lp-hero__sticker--days">{hero.stickerDays}</span>
                </span>
              </div>
            </div>

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

          <div className="lp-hero__burst" data-intro="burst" data-par="-10" aria-hidden>
            {BURST.map((p, i) => (
              <span
                key={i}
                className="lp-hero__burst-piece"
                style={{
                  width: p.width,
                  height: p.height,
                  marginLeft: -p.width / 2,
                  marginTop: -p.height / 2,
                  borderRadius: p.strip ? 6 : "50%",
                  background: p.color,
                }}
              />
            ))}
          </div>

        </section>
      </div>
    </div>
  );
}
