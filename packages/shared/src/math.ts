// Small numeric helpers used by more than one app.

/** `v` limited to [min, max]. */
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/**
 * Deterministic pseudo-random number in [0, 1) for (index, salt) — the same
 * on the server and the client, so SSR and hydration render identical
 * confetti, crumbs and bursts.
 */
export const seededRandom = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
