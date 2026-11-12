import { useEffect, useState } from "react";
import { MEDIA } from "../tokens";

/** Live "prefers-reduced-motion: reduce" (false on the server and the first render). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MEDIA.reducedMotion);
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
