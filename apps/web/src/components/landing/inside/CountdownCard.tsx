import { useRef } from "react";
import { pad2 } from "@pokanito/shared";
import { cx } from "@pokanito/ui";
import { INVITE_SAMPLE, fmt, plural } from "@/content/landing";
import { useLang } from "../i18n";
import CardFoot from "./CardFoot";
import { useCountdown } from "./useCountdown";
import type { InsideCopy } from "./types";

// ── 1 · Live countdown ─────────────────────────────────────────────────────

export default function CountdownCard({ c }: { c: InsideCopy }) {
  const { lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  // Computed on the client only (the server render shows placeholders), then
  // ticks every second while the card is on screen.
  const parts = useCountdown(INVITE_SAMPLE.date, ref);
  const tile = (key: keyof InsideCopy["countdown"]["units"], value: string, hot = false) => (
    <span className={cx("ic-count__tile", hot && "ic-count__tile--hot", key === "sec" && "ic-count__tile--sec")}>
      {/* Keyed by value: the digit slides up when it changes. */}
      <b key={value}>{value}</b>
      <span>{c.countdown.units[key]}</span>
    </span>
  );

  return (
    <div className="ic-card ic-card--blush" ref={ref} style={{ "--tilt": "-2deg" } as React.CSSProperties}>
      <div className="ic-card__demo ic-count">
        <span className="ic-script">{c.countdown.until}</span>
        {/* Labelled once; the ticking numbers are not announced. */}
        <div
          className="ic-count__grid"
          role="group"
          aria-label={parts ? fmt(c.countdown.aria, {
                  days: plural(lang, c.countdown.ariaDays, parts.days),
                  hours: plural(lang, c.countdown.ariaHours, parts.hours),
                  minutes: plural(lang, c.countdown.ariaMinutes, parts.min),
                }) : c.countdown.title}
        >
          {tile("days", parts ? String(parts.days) : "–")}
          {tile("hours", parts ? pad2(parts.hours) : "–")}
          {tile("min", parts ? pad2(parts.min) : "–")}
          {tile("sec", parts ? pad2(parts.sec) : "–", true)}
        </div>
      </div>
      <CardFoot title={c.countdown.title} text={c.countdown.text} />
    </div>
  );
}
