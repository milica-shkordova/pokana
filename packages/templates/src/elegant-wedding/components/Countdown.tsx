import { useMemo } from "react";
import { useInvitation } from "../../engine/runtime";
import { useCountdown } from "../../engine/hooks";
import { CountdownUnits } from "../../engine/components";
import st from "../Template.module.scss";

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
  const c = useCountdown({ pad: "none" });
  const pieces = useMemo(makePieces, []);

  return (
    // "inv__countdown--done" has no styles; kept as a plain hook class.
    <section className={`${st["inv__countdown"]}${c.done ? " inv__countdown--done" : ""}`}>
      {c.done && (
        <div className={st["inv__confetti"]} aria-hidden>
          {pieces.map((p) => (
            <span
              key={p.id}
              className={st["inv__confetti-piece"]}
              style={{
                left: `${p.x}%`,
                width: p.shape === "circle" ? p.size : p.size * 0.6,
                height: p.shape === "circle" ? p.size : p.size * 1.4,
                borderRadius: p.shape === "circle" ? "50%" : "2px",
                background: p.color,
                // Module-scoped keyframes name (see _Countdown.scss).
                animation: `${st["inv-confetti-fall"]} ${p.duration}s ${p.delay}s linear infinite`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {c.done ? (
        <p className={st["inv__countdown-celebrate"]}>{s.countdownDone}</p>
      ) : (
        <>
          <p className={st["inv__label"]}>{t(event.content.countdown?.heading)}</p>
          <div className={st["inv__countdown-grid"]} role="timer" aria-live="off">
            <CountdownUnits
              units={c.units}
              classes={{ item: st["inv__countdown-item"], num: st["inv__countdown-num"], unit: st["inv__countdown-unit"] }}
            />
          </div>
        </>
      )}
    </section>
  );
}
