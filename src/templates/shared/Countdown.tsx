import { useEffect, useMemo, useRef, useState } from "react";

const PIECE_COUNT = 100;
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

function makePieces(colors: string[]): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    delay: -(Math.random() * BASE_DURATION),
    duration: BASE_DURATION + Math.random() * 10,
    rotation: Math.random() * 360,
    shape: Math.random() > 0.4 ? "rect" : "circle",
  }));
}

interface Props {
  targetDate: string;
  targetTime?: string;
  label: string;
  doneLabel: string;
  confettiColors: string[];
}

export default function Countdown({
  targetDate,
  targetTime,
  label,
  doneLabel,
  confettiColors,
}: Props) {
  const target = useMemo(() => {
    const t = new Date(targetDate);
    if (targetTime) {
      const [h, m] = targetTime.split(":").map(Number);
      t.setHours(h, m, 0, 0);
    }
    return t;
  }, [targetDate, targetTime]);

  const pieces = useMemo(() => makePieces(confettiColors), [confettiColors]);

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
    <section className={`tpl-countdown${done ? " tpl-countdown--done" : ""}`}>
      {done && (
        <div className="tpl-confetti" aria-hidden>
          {pieces.map((p) => (
            <span
              key={p.id}
              className="tpl-confetti-piece"
              style={{
                left: `${p.x}%`,
                width: p.shape === "circle" ? p.size : p.size * 0.6,
                height: p.shape === "circle" ? p.size : p.size * 1.4,
                borderRadius: p.shape === "circle" ? "50%" : "2px",
                background: p.color,
                animation: `tpl-confetti-fall ${p.duration}s ${p.delay}s linear infinite`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {done ? (
        <p className="tpl-countdown-celebrate" data-reveal>
          {doneLabel}
        </p>
      ) : (
        <>
          <p className="tpl-label" data-reveal>
            {label}
          </p>
          <div className="tpl-countdown-grid" data-reveal-group>
            <div className="tpl-countdown-item" data-reveal-item>
              <span className="tpl-countdown-num">{timeLeft?.days}</span>
              <span className="tpl-countdown-unit">days</span>
            </div>
            <div className="tpl-countdown-item" data-reveal-item>
              <span className="tpl-countdown-num">{timeLeft?.hours}</span>
              <span className="tpl-countdown-unit">hours</span>
            </div>
            <div className="tpl-countdown-item" data-reveal-item>
              <span className="tpl-countdown-num">{timeLeft?.minutes}</span>
              <span className="tpl-countdown-unit">min</span>
            </div>
            <div className="tpl-countdown-item" data-reveal-item>
              <span className="tpl-countdown-num">{timeLeft?.seconds}</span>
              <span className="tpl-countdown-unit">sec</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
