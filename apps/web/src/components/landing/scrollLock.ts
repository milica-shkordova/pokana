/**
 * Locks page scrolling without hiding the scrollbar (hiding it, e.g. with
 * `overflow: hidden`, makes the page widen and jump). Wheel, touch and scroll
 * keys are ignored, and anything else that scrolls the page (dragging the
 * scrollbar) is put back. `allow`: an element inside which scrolling still
 * works (e.g. the phone menu). Returns the unlock function.
 */
export function lockScroll(allow?: Element | null): () => void {
  const x = window.scrollX;
  const y = window.scrollY;
  const inside = (t: EventTarget | null) => !!allow && t instanceof Node && allow.contains(t);
  const KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

  const block = (e: Event) => {
    if (!inside(e.target)) e.preventDefault();
  };
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (KEYS.has(e.key) && !inside(e.target)) e.preventDefault();
  };
  const onScroll = () => {
    if (window.scrollX !== x || window.scrollY !== y) window.scrollTo(x, y);
  };

  window.addEventListener("wheel", block, { passive: false });
  window.addEventListener("touchmove", block, { passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScroll);
  return () => {
    window.removeEventListener("wheel", block);
    window.removeEventListener("touchmove", block);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll);
  };
}
