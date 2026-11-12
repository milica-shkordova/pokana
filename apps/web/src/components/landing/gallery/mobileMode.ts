import gsap from "gsap";
import { HIDDEN } from "./constants";
import { INNER_SCROLL } from "./geometry";
import type { GalleryEnv } from "./types";

/**
 * Tablet / phone: native scroll-snap carousel; IntersectionObserver picks the
 * centre phone. Runs inside gsap.matchMedia(); returns its cleanup.
 */
export function setupMobileMode(env: GalleryEnv): () => void {
  const { viewport, ctrl, allItems, visibleItems, scrollFrame, lastScroll, onNear, requestMount } = env;

  const items = allItems();
  const inCentre = new Set<HTMLElement>();
  let focused: HTMLElement | null = null;
  let inner: gsap.core.Tween | null = null;

  const setFocus = (next: HTMLElement | null, force = false) => {
    if (next === focused && !force) return;
    focused = next;
    const vis = visibleItems();
    const fi = next ? vis.indexOf(next) : -1;
    items.forEach((el) => {
      const i = vis.indexOf(el);
      el.dataset.focus = i < 0 || fi < 0 ? "" : i === fi ? "center" : i < fi ? "left" : "right";
      if (el !== next) scrollFrame(el, 0);
    });
    inner?.kill();
    inner = null;
    if (next) {
      const o = { y: 0 };
      inner = gsap.to(o, {
        y: INNER_SCROLL,
        duration: 2.4,
        delay: 0.5,
        ease: "power1.inOut",
        onUpdate: () => scrollFrame(next, o.y),
      });
    }
  };

  const pick = (force = false) => {
    const r = viewport.getBoundingClientRect();
    const mid = r.left + r.width / 2;
    let best: HTMLElement | null = null;
    let bestD = Infinity;
    inCentre.forEach((el) => {
      if (el.classList.contains(HIDDEN)) return;
      const b = el.getBoundingClientRect();
      const d = Math.abs(b.left + b.width / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = el;
      }
    });
    setFocus(best, force);
  };

  const focusIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? inCentre.add(e.target as HTMLElement) : inCentre.delete(e.target as HTMLElement)));
      pick();
    },
    { root: viewport, rootMargin: "0px -45% 0px -45%" },
  );

  // Mount iframes for phones on screen or one screen to either side.
  const pending = new Set<string>();
  const mountIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const id = (e.target as HTMLElement).dataset.id;
        if (!id) return;
        if (!e.isIntersecting) pending.delete(id);
        else if (env.near) requestMount(id);
        else pending.add(id);
      });
    },
    { root: viewport, rootMargin: "0px 100% 0px 100%" },
  );
  const flushPending = () => pending.forEach((id) => requestMount(id));
  onNear.add(flushPending);

  items.forEach((el) => {
    focusIO.observe(el);
    mountIO.observe(el);
  });

  ctrl.current = {
    relayout: () => pick(true),
    frameLoaded: (frame) => {
      lastScroll.delete(frame);
      if (focused?.contains(frame)) setFocus(focused, true);
    },
  };

  return () => {
    ctrl.current = null;
    onNear.delete(flushPending);
    focusIO.disconnect();
    mountIO.disconnect();
    inner?.kill();
    items.forEach((el) => delete el.dataset.focus);
  };
}
