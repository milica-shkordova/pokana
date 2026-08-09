import { useMemo } from "react";

const COLORS = ["#c17f5f", "#c9a24d", "#7f9b82", "#7d93a6", "#d4a8b0"];
const PIECE_COUNT = 40;

interface Piece {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
}

export default function ConfettiBurst() {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        id: i,
        angle: Math.random() * 360,
        distance: 60 + Math.random() * 120,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.random() * 6,
        delay: Math.random() * 0.15,
        rotation: Math.random() * 360,
      })),
    [],
  );

  return (
    <div className="landing__confetti" aria-hidden>
      {pieces.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <span
            key={p.id}
            className="landing__confetti-piece"
            style={
              {
                "--x": `${x}px`,
                "--y": `${y}px`,
                "--rot": `${p.rotation}deg`,
                width: p.size,
                height: p.size * 1.4,
                background: p.color,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
