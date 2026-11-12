import { useEffect, useState } from "react";

/** Re-renders every `intervalMs` (so relative times like "Saved 2 min ago" stay fresh); returns the current time. */
export function useNow(intervalMs: number) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return Date.now();
}
