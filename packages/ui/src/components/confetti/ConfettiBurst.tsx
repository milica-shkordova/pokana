import { useMemo, type CSSProperties } from "react";
import { CONFETTI_COLORS } from "../../tokens";
import { randomConfettiPieces } from "../../utils/confettiPieces";

const PIECE_COUNT = 40;

// Pokanito confetti: --ui-color-{coral,marigold,rose,sage,terracotta}.
export function ConfettiBurst({ colors = CONFETTI_COLORS }: { colors?: string[] }) {
  const pieces = useMemo(() => randomConfettiPieces(PIECE_COUNT, colors), [colors]);

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
