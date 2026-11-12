import { useEffect, useState, type RefObject } from "react";
import type { CountdownParts } from "./types";

/**
 * Time left until `date`. Computed on the client only (null on the server,
 * so it renders placeholders), then ticks every second while `ref` is on
 * screen.
 */
export function useCountdown(date: string, ref: RefObject<HTMLElement>): CountdownParts | null {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(date).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
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

  const s = left === null ? null : Math.floor(left / 1000);
  return s === null
    ? null
    : { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), min: Math.floor((s % 3600) / 60), sec: s % 60 };
}
