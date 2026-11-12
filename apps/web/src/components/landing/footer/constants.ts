import { CONFETTI_COLORS } from "@pokanito/ui";
import { rnd } from "@/lib/random";

// Deterministic "random" (lib/random) so server and client render the same confetti.
export const RAIN = Array.from({ length: 30 }, (_, i) => ({
  left: `${(rnd(i, 8) * 100).toFixed(1)}%`,
  strip: rnd(i, 7) > 0.5,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  duration: `${(6 + rnd(i, 9) * 6).toFixed(1)}s`,
  delay: `${(-rnd(i, 10) * 10).toFixed(1)}s`,
}));
