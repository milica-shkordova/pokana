import { useRef, useState, type DependencyList, type RefObject } from "react";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect";

/** Box of the active item, relative to its container (offset* values). */
export interface IndicatorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Measures the active item of a group (tabs, segmented control, language
 * toggle) so a pill can slide behind it. Re-measures when `deps` change and
 * whenever the container resizes (fonts loading, labels changing). The rect is
 * null until measured, when nothing matches `selector`, or while disabled.
 */
export function useSlidingIndicator<T extends HTMLElement = HTMLDivElement>(
  /** Selects the active item inside the container. */
  selector: string,
  deps: DependencyList,
  enabled = true,
): [RefObject<T>, IndicatorRect | null] {
  const container = useRef<T>(null);
  const [rect, setRect] = useState<IndicatorRect | null>(null);
  useIsoLayoutEffect(() => {
    if (!enabled) return;
    const el = container.current;
    if (!el) return;
    const place = () => {
      const on = el.querySelector<HTMLElement>(selector);
      setRect(on ? { left: on.offsetLeft, top: on.offsetTop, width: on.offsetWidth, height: on.offsetHeight } : null);
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, selector, ...deps]);
  return [container, rect];
}
