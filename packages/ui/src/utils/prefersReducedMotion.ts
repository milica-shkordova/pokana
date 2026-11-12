import { MEDIA } from "../tokens";

/** True when the visitor asked for reduced motion. False on the server. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && !!window.matchMedia?.(MEDIA.reducedMotion).matches;
