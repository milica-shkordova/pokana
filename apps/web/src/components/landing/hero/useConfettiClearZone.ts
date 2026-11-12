import { useEffect, type RefObject } from "react";
import { CONFETTI_SETTLE_EVENT, keepConfettiClear } from "./confettiZone";

/**
 * Keep confetti off the text: hide pieces over the headline / paragraph /
 * buttons and thin out the gap between text and photos. Re-applied when the
 * burst lands and whenever the layout changes size (language, viewport).
 */
export function useConfettiClearZone(root: RefObject<HTMLElement>, lang: string) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const apply = () => keepConfettiClear(el);
    apply();
    const ro = new ResizeObserver(apply);
    const copy = el.querySelector(".lp-hero__copy");
    if (copy) ro.observe(copy);
    ro.observe(el);
    window.addEventListener(CONFETTI_SETTLE_EVENT, apply);
    return () => {
      ro.disconnect();
      window.removeEventListener(CONFETTI_SETTLE_EVENT, apply);
    };
  }, [root, lang]);
}
