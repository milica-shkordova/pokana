import { useMemo } from "react";
import { useInvitation } from "../../engine/runtime";
import { useCountdown } from "../../engine/hooks";

const COLORS = ["#d4a8b0", "#b8956a", "#e8d5c4", "#c9b8a8", "#f0e6d3", "#a89080"];
const PIECE_COUNT = 120;
const BASE_DURATION = 5;

function makePieces() {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    delay: -(Math.random() * BASE_DURATION),
    duration: BASE_DURATION + Math.random() * 10,
    rotation: Math.random() * 360,
    shape: Math.random() > 0.4 ? "rect" : "circle",
  }));
}

export default function Countdown() {
  const { t, s, event } = useInvitation();
  const c = useCountdown();
  const pieces = useMemo(makePieces, []);

  return (
    <section className={`inv__countdown${c.done ? " inv__countdown--done" : ""}`}>
      {c.done && (
        <div className="inv__confetti" aria-hidden>
          {pieces.map((p) => (
            <span
              key={p.id}
              className="inv__confetti-piece"
              style={{
                left: `${p.x}%`,
                width: p.shape === "circle" ? p.size : p.size * 0.6,
                height: p.shape === "circle" ? p.size : p.size * 1.4,
                borderRadius: p.shape === "circle" ? "50%" : "2px",
                background: p.color,
                animation: `inv-confetti-fall ${p.duration}s ${p.delay}s linear infinite`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {c.done ? (
        <p className="inv__countdown-celebrate">{s.countdownDone}</p>
      ) : (
        <>
          <p className="inv__label">{t(event.content.countdown?.heading)}</p>
          <div className="inv__countdown-grid" role="timer" aria-live="off">
            {(
              [
                [c.days, s.days],
                [c.hours, s.hours],
                [c.minutes, s.minutes],
                [c.seconds, s.seconds],
              ] as const
            ).map(([n, unit]) => (
              <div className="inv__countdown-item" key={unit}>
                <span className="inv__countdown-num">{c.ready ? n : "–"}</span>
                <span className="inv__countdown-unit">{unit}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
