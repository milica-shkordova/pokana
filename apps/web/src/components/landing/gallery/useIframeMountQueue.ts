import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Mount a phone's demo iframe (once; it stays mounted afterwards). Each
 * iframe lays out a whole template page on this thread in one go (a visible
 * hitch on phones), so they are queued and created one at a time, each
 * once scrolling has paused for a moment (or after at most ~4s: someone
 * scrolling straight past sees the thumbnails, which is fine).
 *
 * Returns the mounted ids and `requestMount(id)`.
 */
export function useIframeMountQueue() {
  const [mounted, setMounted] = useState<Record<string, true>>({});
  const mountedRef = useRef<Record<string, true>>({});

  const mounter = useRef({ queue: [] as string[], timer: undefined as number | undefined, lastScroll: 0, waited: 0 });
  useEffect(() => {
    const m = mounter.current;
    const onScroll = () => (m.lastScroll = performance.now());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(m.timer);
    };
  }, []);
  const requestMount = useCallback((id: string | undefined) => {
    const m = mounter.current;
    if (!id || mountedRef.current[id] || m.queue.includes(id)) return;
    m.queue.push(id);
    const STEP = 150;
    const tick = () => {
      m.timer = undefined;
      m.waited += STEP;
      if (performance.now() - m.lastScroll < 250 && m.waited < 4000) return schedule();
      m.waited = 0;
      const next = m.queue.shift();
      if (!next) return;
      mountedRef.current = { ...mountedRef.current, [next]: true };
      setMounted(mountedRef.current);
      if (m.queue.length) schedule();
    };
    const schedule = () => {
      if (m.timer === undefined) m.timer = window.setTimeout(tick, STEP);
    };
    schedule();
  }, []);

  return { mounted, requestMount };
}
