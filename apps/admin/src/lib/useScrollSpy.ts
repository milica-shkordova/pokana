import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Which of a page's stacked sections is "current", for a sticky section nav.
 *
 * The current one is the last section whose top has passed a line `offset`
 * px below the top of the viewport. At the very bottom of the page the last
 * sections can never reach that line, so there the last section that is on
 * screen wins instead (otherwise e.g. "Your account" could never light up).
 * `select(id)` highlights a nav click right away and keeps it until the user
 * scrolls by hand (the smooth scroll there, or a section that can't reach the
 * line near the bottom, doesn't move the highlight).
 */
export function useScrollSpy(
  /** Element ids in page order, or a selector for the sections (ids are read from the page). */
  source: readonly string[] | string,
  { offset = 140, enabled = true, deps = "" }: { offset?: number; enabled?: boolean; deps?: string } = {},
) {
  const [active, setActive] = useState<string>(typeof source === "string" ? "" : (source[0] ?? ""));
  const held = useRef<string | null>(null);
  const key = (typeof source === "string" ? source : source.join("|")) + "#" + deps;

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const els: (readonly [string, HTMLElement])[] =
        typeof source === "string"
          ? Array.from(document.querySelectorAll<HTMLElement>(source)).map((el) => [el.id, el] as const)
          : source
              .map((id) => [id, document.getElementById(id)] as const)
              .filter((x): x is readonly [string, HTMLElement] => !!x[1]);
      if (!els.length) return;
      if (held.current) return; // a nav click wins until the user scrolls

      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = els[0][0];
      if (atBottom) {
        for (const [id, el] of els) if (el.getBoundingClientRect().top < window.innerHeight - 80) current = id;
      } else {
        for (const [id, el] of els) if (el.getBoundingClientRect().top <= offset) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    // Scrolling by hand releases a clicked item.
    const release = (e: Event) => {
      if (e instanceof KeyboardEvent && !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) return;
      if (!held.current) return;
      held.current = null;
      onScroll();
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", release);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, offset, enabled]);

  const select = useCallback((id: string) => {
    held.current = id;
    setActive(id);
  }, []);

  return [active, select] as const;
}
