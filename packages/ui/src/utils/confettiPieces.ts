/** One piece of a <ConfettiBurst>: where it flies, how it looks. */
export interface ConfettiPiece {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
}

/** `count` randomly scattered confetti pieces in the given colours. */
export function randomConfettiPieces(count: number, colors: string[]): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 60 + Math.random() * 120,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 5 + Math.random() * 6,
    delay: Math.random() * 0.15,
    rotation: Math.random() * 360,
  }));
}
