import { CONFETTI_COLORS } from "@pokanito/ui";

/** Confetti pieces of the "message sent" burst (Contact.tsx). */
export const BURST = Array.from({ length: 26 }, (_, i) => ({ color: CONFETTI_COLORS[i % CONFETTI_COLORS.length], strip: i % 3 === 0 }));
