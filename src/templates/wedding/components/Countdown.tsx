import { useEffect, useMemo, useRef, useState } from "react";
import { WeddingConfig } from "../types";

const COLORS = [
  "#d4a8b0",
  "#b8956a",
  "#e8d5c4",
  "#c9b8a8",
  "#f0e6d3",
  "#a89080",
];
const PIECE_COUNT = 120;
const BASE_DURATION = 5;

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  shape: "rect" | "circle";
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function makePieces(): Piece[] {
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

interface Props {
  config: WeddingConfig;
}

export default function Countdown({ config }: Props) {
  const target = useMemo(() => {
    const [h, m] = config.program[0].time.split(":").map(Number);
    const t = new Date(config.weddingDate);
    t.setHours(h, m, 0, 0);
    return t;
  }, [config.program, config.weddingDate]);

  const pieces = useMemo(makePieces, []);

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));
  const [done, setDone] = useState(() => getTimeLeft(target) === null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const t = getTimeLeft(target);
      setTimeLeft(t);
      if (t === null && !hasTriggered.current) {
        hasTriggered.current = true;
        setDone(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <section className={`inv__countdown${done ? " inv__countdown--done" : ""}`}>
      {done && (
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

      {done ? (
        <p className="inv__countdown-celebrate">Свадбата е започната</p>
      ) : (
        <>
          <p className="inv__label">Свадбата започнува за:</p>
          <div className="inv__countdown-grid">
            <div className="inv__countdown-item">
              <span className="inv__countdown-num">{timeLeft?.days}</span>
              <span className="inv__countdown-unit">денови</span>
            </div>
            <div className="inv__countdown-item">
              <span className="inv__countdown-num">{timeLeft?.hours}</span>
              <span className="inv__countdown-unit">часови</span>
            </div>
            <div className="inv__countdown-item">
              <span className="inv__countdown-num">{timeLeft?.minutes}</span>
              <span className="inv__countdown-unit">минути</span>
            </div>
            <div className="inv__countdown-item">
              <span className="inv__countdown-num">{timeLeft?.seconds}</span>
              <span className="inv__countdown-unit">секунди</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
