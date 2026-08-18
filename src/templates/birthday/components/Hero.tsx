import { useRef } from "react";
import { BirthdayConfig, BirthdayTheme } from "../types";
import { useCircleReveal } from "../../shared/useCircleReveal";

interface Props {
  config: BirthdayConfig;
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const THEME_BADGE: Record<BirthdayTheme, string> = {
  superhero: "🦸",
  princess: "👑",
};

export default function Hero({ config }: Props) {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  useCircleReveal(imgWrapRef);

  return (
    <section className="bday__hero">
      <div className="bday__hero-image-wrap" ref={imgWrapRef}>
        <img className="bday__hero-img" src={config.images.hero} alt="" />
      </div>
      <div className="bday__hero-text" data-reveal-scale>
        {config.theme && (
          <span className="bday__hero-badge" aria-hidden>
            {THEME_BADGE[config.theme]}
          </span>
        )}
        <p className="tpl-sub-text">{config.partyDateLabel}</p>
        <h1 className="bday__hero-title">
          {config.childName}&apos;s {ordinal(config.age)} Birthday!
        </h1>
        <p className="bday__hero-message">{config.message}</p>
      </div>
    </section>
  );
}
