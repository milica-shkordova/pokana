import { useEffect, useState } from "react";
import { LOCALES } from "@pokanito/shared";
import { cx } from "@pokanito/ui";
import { INVITE_SAMPLE, type Lang } from "@/content/landing";
import CardFoot from "./CardFoot";
import type { InsideCopy } from "./types";

// ── 4 · Language ───────────────────────────────────────────────────────────
export default function LanguageCard({ c, pageLang }: { c: InsideCopy; pageLang: Lang }) {
  // Only switches the sample invitation in this card, not the page.
  const [lang, setLang] = useState<Lang>(pageLang);
  useEffect(() => setLang(pageLang), [pageLang]);
  const sample = INVITE_SAMPLE[lang];
  return (
    <div className="ic-card ic-card--mist" style={{ "--tilt": "2deg" } as React.CSSProperties}>
      <div className="ic-card__demo ic-lang">
        <div className="ic-lang__switch" role="group" aria-label={c.language.switchLabel}>
          {LOCALES.map((l) => (
            <button key={l} type="button" className={cx(lang === l && "is-on")} aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l === "mk" ? "MK" : "EN"}
            </button>
          ))}
        </div>
        {/* Keyed by language: crossfades on change. */}
        <div className="ic-lang__sample" key={lang} lang={lang}>
          <span className="ic-lang__names">{sample.names}</span>
          <span className="ic-lang__text">{sample.text}</span>
        </div>
      </div>
      <CardFoot title={c.language.title} text={c.language.text} />
    </div>
  );
}
