import { useRef } from "react";
import { fmt } from "@/content/landing";
import { LangToggle, useLang } from "./i18n";
import { RAIN } from "./footer/constants";
import { useFooterFinale } from "./footer/useFooterFinale";
import type { FooterProps } from "./footer/types";

/**
 * Footer finale (HANDOFF-ANIMATIONS A4 + B9): the M mark pops, a huge
 * "Pokanito." rises letter by letter, the tagline fades in, and confetti
 * rains behind it while the footer is on screen. The small footer row stays
 * underneath.
 */
export default function Footer({ businessName, instagram }: FooterProps) {
  const root = useRef<HTMLElement>(null);
  const handle = instagram?.replace(/^@/, "");
  const f = useLang().t.footer;
  // Lowercase like the logo's wordmark ("pokanito."); the aria-label and the
  // copyright line keep the capitalised name.
  const word = `${businessName.toLocaleLowerCase()}.`.split("");

  useFooterFinale(root);

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
