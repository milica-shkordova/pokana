import { useState } from "react";
import { cx } from "@pokanito/ui";
import CardFoot from "./CardFoot";
import { SPOTS } from "./constants";
import type { InsideCopy } from "./types";

// ── 3 · Directions ─────────────────────────────────────────────────────────
export default function DirectionsCard({ c }: { c: InsideCopy }) {
  const [place, setPlace] = useState(1); // Venue
  const d = c.directions;
  const spot = SPOTS[place];
  return (
    <div className="ic-card ic-card--honey" style={{ "--tilt": "-1.5deg" } as React.CSSProperties}>
      <div className="ic-card__demo ic-map">
        <span className="ic-map__area" aria-hidden>
          <span className="ic-map__road ic-map__road--h" />
          <span className="ic-map__road ic-map__road--v" />
          <span className="ic-map__road ic-map__road--d" />
          <span className="ic-map__pin" style={{ left: `calc(${spot.left}% - 15px)`, top: `calc(${spot.top}% - 15px)` }}>
            <span />
          </span>
        </span>
        <div className="ic-map__places">
          {d.places.map((label, i) => (
            <button key={i} type="button" className={cx(place === i && "is-on")} aria-pressed={place === i} onClick={() => setPlace(i)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <CardFoot title={d.title} text={d.text} />
    </div>
  );
}
