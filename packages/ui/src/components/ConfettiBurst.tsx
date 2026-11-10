import { useMemo, type CSSProperties } from "react";

// Momentelo confetti: --ui-color-{coral,marigold,rose,sage,terracotta}.
const DEFAULT_COLORS = ["#d9693f", "#e9a94f", "#ee9c92", "#9db59a", "#b5502f"];
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

export function ConfettiBurst({ colors = DEFAULT_COLORS }: { colors?: string[] }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        id: i,
        angle: Math.random() * 360,
        distance: 60 + Math.random() * 120,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        delay: Math.random() * 0.15,
        rotation: Math.random() * 360,
      })),
    [colors],
  );

  return (
    <div className="ui-confetti" aria-hidden>
      {pieces.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <span
            key={p.id}
            className="ui-confetti__piece"
            style={
              {
                "--x": `${x}px`,
                "--y": `${y}px`,
                "--rot": `${p.rotation}deg`,
                width: p.size,
                height: p.size * 1.4,
                background: p.color,
                animationDelay: `${p.delay}s`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
