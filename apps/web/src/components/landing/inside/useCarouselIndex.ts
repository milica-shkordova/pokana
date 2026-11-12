import { useEffect, useState, type RefObject } from "react";

/** Phone carousel: the dot follows the card closest to the start. */
export function useCarouselIndex(track: RefObject<HTMLElement>) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const card = el.firstElementChild as HTMLElement | null;
        if (!card) return;
        setActive(Math.min(3, Math.round(el.scrollLeft / (card.offsetWidth + 12))));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [track]);

  return active;
}
