import { useState } from "react";
import { cx } from "@pokanito/ui";
import { plural } from "@/content/landing";
import { useLang } from "../i18n";
import CardFoot from "./CardFoot";
import type { InsideCopy } from "./types";

// ── 2 · RSVP ───────────────────────────────────────────────────────────────
export default function RsvpCard({ c }: { c: InsideCopy }) {
  const { lang } = useLang();
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [guests, setGuests] = useState(2);
  const r = c.rsvp;
  return (
    <div className="ic-card ic-card--mint" style={{ "--tilt": "1.5deg" } as React.CSSProperties}>
      <div className="ic-card__demo ic-rsvp">
        <button
          type="button"
          className={cx("ic-rsvp__choice", answer === "yes" && "is-on")}
          aria-pressed={answer === "yes"}
          onClick={() => setAnswer("yes")}
        >
          {r.yes}
        </button>
        <div className={cx("ic-rsvp__guests", answer === "yes" && "is-open")} aria-hidden={answer !== "yes"}>
          <span>{r.guests}</span>
          <span className="ic-rsvp__stepper">
            <button
              type="button"
              aria-label={r.fewer}
              tabIndex={answer === "yes" ? 0 : -1}
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
            >
              −
            </button>
            <b>{guests}</b>
            <button
              type="button"
              className="ic-rsvp__plus"
              aria-label={r.more}
              tabIndex={answer === "yes" ? 0 : -1}
              onClick={() => setGuests((g) => Math.min(9, g + 1))}
            >
              +
            </button>
          </span>
        </div>
        <button
          type="button"
          className={cx("ic-rsvp__choice", answer === "no" && "is-on")}
          aria-pressed={answer === "no"}
          onClick={() => setAnswer("no")}
        >
          {r.no}
        </button>
        <p className={cx("ic-rsvp__done", answer && "is-shown")} aria-live="polite">
          {answer === "yes" ? `${r.sentYes} · ${plural(lang, r.guestCount, guests)}` : answer === "no" ? r.sentNo : ""}
        </p>
      </div>
      <CardFoot title={r.title} text={r.text} />
    </div>
  );
}
