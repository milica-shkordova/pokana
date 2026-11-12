import { useEffect, useState, type RefObject } from "react";
import { countdownParts } from "@pokanito/shared";
import type { CountdownParts } from "./types";

/**
 * Time left until `date`. Computed on the client only (null on the server,
 * so it renders placeholders), then ticks every second while `ref` is on
 * screen.
 */
export function useCountdown(date: string, ref: RefObject<HTMLElement>): CountdownParts | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    let id: number | undefined;
    const start = () => {
      if (id === undefined) id = window.setInterval(tick, 1000);
    };
    const stop = () => {
      clearInterval(id);
      id = undefined;
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? (tick(), start()) : stop()));
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      stop();
    };
  }, [date, ref]);

  if (now === null) return null;
  const p = countdownParts(date, now);
  return { days: p.days, hours: p.hours, min: p.minutes, sec: p.seconds };
}
