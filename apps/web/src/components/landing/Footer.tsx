import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CONFETTI_COLORS, MEDIA } from "@pokanito/ui";
import { fmt } from "@/content/landing";
import { LangToggle, useLang } from "./i18n";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Deterministic "random" so server and client render the same confetti.
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const RAIN = Array.from({ length: 30 }, (_, i) => ({
  left: `${(rnd(i, 8) * 100).toFixed(1)}%`,
  strip: rnd(i, 7) > 0.5,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  duration: `${(6 + rnd(i, 9) * 6).toFixed(1)}s`,
  delay: `${(-rnd(i, 10) * 10).toFixed(1)}s`,
}));

/**
 * Footer finale (HANDOFF-ANIMATIONS A4 + B9): the M mark pops, a huge
 * "Pokanito." rises letter by letter, the tagline fades in, and confetti
 * rains behind it while the footer is on screen. The small footer row stays
 * underneath.
 */
export default function Footer({ businessName, instagram }: { businessName: string; instagram?: string; logoUrl?: string | null }) {
  const root = useRef<HTMLElement>(null);
  const handle = instagram?.replace(/^@/, "");
  const f = useLang().t.footer;
  // Lowercase like the logo's wordmark ("pokanito."); the aria-label and the
  // copyright line keep the capitalised name.
  const word = `${businessName.toLocaleLowerCase()}.`.split("");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        const letters = gsap.utils.toArray<HTMLElement>(".lp-finale__char");
        // Plays (not scrubbed) once the name itself is well into view, so it
        // never finishes before you can see it. Reverses when scrolled back up.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".lp-finale__word", start: "top 75%", toggleActions: "play none none reverse" },
        });
        tl.fromTo(
          ".lp-finale__mark",
          { opacity: 0, y: 80, scale: 0.6, rotate: -10 },
          { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.7)" },
          0,
        );
        letters.forEach((ch, i) => {
          tl.fromTo(
            ch,
            { opacity: 0, y: 160, rotate: i % 2 ? 8 : -8 },
            { opacity: 1, y: 0, rotate: 0, duration: 0.7, ease: "back.out(1.7)" },
            0.3 + i * 0.08,
          );
        });
        tl.fromTo(".lp-finale__tag", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "none" }, ">-0.2");

        // Confetti rain only runs while the footer is on screen.
        ScrollTrigger.create({
          trigger: ".lp-finale",
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => root.current?.classList.toggle("is-raining", self.isActive),
        });
        return () => root.current?.classList.remove("is-raining");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <footer className="lp-footer" ref={root}>
      <div className="lp-finale">
        <div className="lp-finale__rain" aria-hidden>
          {RAIN.map((r, i) => (
            <span
              key={i}
              className={r.strip ? "lp-finale__drop lp-finale__drop--strip" : "lp-finale__drop"}
              style={{ left: r.left, background: r.color, animationDuration: r.duration, animationDelay: r.delay }}
            />
          ))}
        </div>
        {/* The P mark (pokanito-mark.svg). */}
        <img className="lp-finale__mark" src="/brand/pokanito-mark.svg" alt="" aria-hidden />
        <p className="lp-finale__word" aria-label={businessName}>
          {word.map((ch, i) => (
            <span
              key={i}
              aria-hidden
              className={i === word.length - 1 ? "lp-finale__char lp-finale__char--dot" : "lp-finale__char"}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
        <p className="lp-finale__tag">{f.tagline}</p>
      </div>

      <div className="lp-wrap lp-footer__row">
        {handle && (
          <a href={`https://instagram.com/${handle}`} target="_blank" rel="noreferrer">
            @{handle}
          </a>
        )}
        <span>{fmt(f.rights, { year: new Date().getFullYear(), name: businessName })}</span>
        {/* Phones: the fixed header already has the toggle (hidden in CSS). */}
        <span className="lp-footer__lang">
          <LangToggle />
        </span>
      </div>
    </footer>
  );
}
