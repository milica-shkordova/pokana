import type { MiddlewareHandler } from "hono";
import { clientIp, errorBody } from "./http";

// Fixed-window, in-memory rate limiter. Good enough for a single API
// instance; swap for a Redis-backed limiter if you ever run several.

interface Options {
  windowMs: number;
  max: number;
  /** Separate buckets per route group. */
  name: string;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}, 60_000).unref();

export function rateLimit({ windowMs, max, name }: Options): MiddlewareHandler {
  return async (c, next) => {
    const key = `${name}:${clientIp(c)}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    if (bucket.count > max) {
      c.header("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      return c.json(errorBody("Too many requests — please try again in a moment."), 429);
    }
    await next();
  };
}
