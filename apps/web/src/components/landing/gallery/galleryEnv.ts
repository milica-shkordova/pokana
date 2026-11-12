import type { MutableRefObject } from "react";
import { ITEM, HIDDEN } from "./constants";
import { FRAME_SCALE } from "./geometry";
import type { Controller, GalleryElements, GalleryEnv } from "./types";

/**
 * What both gallery motion modes share: item lookups, the "section is near"
 * signal that gates the demo iframes, and the phones' inner scroll. Returns
 * the env and its cleanup (disconnects the near observer).
 */
export function createGalleryEnv(
  els: GalleryElements,
  requestMount: (id: string | undefined) => void,
  ctrl: MutableRefObject<Controller | null>,
): [GalleryEnv, () => void] {
  const { section, track } = els;

  const allItems = () => Array.from(track.querySelectorAll<HTMLElement>(ITEM));
  const visibleItems = () => allItems().filter((el) => !el.classList.contains(HIDDEN));
  const phoneOf = (item: HTMLElement) => item.querySelector<HTMLElement>(".lp-gallery__phone")!;

  // Demo iframes only load once the section is close (keeps them out of
  // the initial page load / Lighthouse run).
  let near = false;
  const onNear = new Set<() => void>();
  const becomeNear = () => {
    if (near) return;
    near = true;
    nearIO.disconnect();
    onNear.forEach((fn) => fn());
  };
  const nearIO = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && becomeNear(), {
    rootMargin: "50% 0px",
  });
  nearIO.observe(section);

  // Inner scroll of a phone's invitation: scroll the (same-origin) demo
  // document itself, so the template's own scroll reveals play.
  const lastScroll = new WeakMap<HTMLIFrameElement, number>();
  const scrollFrame = (item: HTMLElement, screenPx: number) => {
    const frame = item.querySelector("iframe");
    if (!frame) return;
    const y = Math.round(screenPx / FRAME_SCALE);
    if (lastScroll.get(frame) === y) return;
    lastScroll.set(frame, y);
    try {
      frame.contentWindow?.scrollTo(0, y);
    } catch {
      /* not loaded yet / cross-origin: ignore */
    }
  };

  const env: GalleryEnv = {
    ...els,
    allItems,
    visibleItems,
    phoneOf,
    get near() {
      return near;
    },
    onNear,
    lastScroll,
    scrollFrame,
    requestMount,
    ctrl,
  };
  return [env, () => nearIO.disconnect()];
}
