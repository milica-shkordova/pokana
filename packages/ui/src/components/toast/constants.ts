/** How long a toast stays up before it leaves (ms). Errors stay longer. */
export const TOAST_LIFETIME_MS = { default: 3000, error: 6000 } as const;

/** Matches the `ui-toast-out` animation in _surfaces.scss. */
export const LEAVE_MS = 200;
