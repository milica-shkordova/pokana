import gsap from "gsap";
import { clamp } from "@pokanito/shared";
import { ITEM, MOUNT_RANGE } from "./constants";
import { focusOf, GAP, PHONE_W, STAGE_H, trackGeometry } from "./geometry";
import type { GalleryEnv } from "./types";

/**
 * Desktop: pinned, scrubbed sideways row. Runs inside gsap.matchMedia();
 * returns its cleanup.
 */
export function setupDesktopMode(env: GalleryEnv): () => void {
  const { section, viewport, stage, track, bar, ctrl } = env;
  const { allItems, visibleItems, phoneOf, scrollFrame, lastScroll, onNear, requestMount } = env;

  const proxy = { p: 0 };
  const hover = new Map<HTMLElement, { h: number }>();
  let W = 0; // stage width in unscaled px
  let vis: HTMLElement[] = [];
  let geo = trackGeometry(0, 0);

  const measure = () => {
    // Scale the 620px-tall stage down on short viewports so phones fit.
    const k = clamp(viewport.clientHeight / STAGE_H, 0.5, 1);
    W = viewport.clientWidth / k;
    gsap.set(stage, { width: W, scale: k, x: 0, y: 0, xPercent: -50, yPercent: -50 });
    vis = visibleItems();
    geo = trackGeometry(W, vis.length);
  };

  const render = () => {
    const shift = -proxy.p * geo.travel;
    gsap.set(track, { x: geo.first - PHONE_W / 2 + shift });
    vis.forEach((item, i) => {
      const d = (geo.first + i * GAP + shift - W / 2) / GAP;
      const f = focusOf(d, hover.get(item)?.h ?? 0);
      gsap.set(phoneOf(item), { scale: f.scale, rotation: f.rotation });
      scrollFrame(item, f.scroll);
      if (env.near && Math.abs(d) <= MOUNT_RANGE) requestMount(item.dataset.id);
    });
    gsap.set(bar, { scaleX: proxy.p });
  };

  const tween = gsap.to(proxy, {
    p: 1,
    ease: "none",
    onUpdate: render,
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=250%",
      pin: true,
      scrub: 1,
      refreshPriority: 2,
      onRefresh: () => {
        measure();
        render();
      },
    },
  });
  measure();
  render();
  onNear.add(render);

  // Hover: straighten and +0.04 (blended through render so scroll and hover compose).
  const setHover = (item: HTMLElement, h: number) => {
    let o = hover.get(item);
    if (!o) hover.set(item, (o = { h: 0 }));
    gsap.to(o, { h, duration: 0.25, ease: "power2.out", overwrite: true, onUpdate: render });
  };
  const onEnter = (e: Event) => setHover(e.currentTarget as HTMLElement, 1);
  const onLeave = (e: Event) => setHover(e.currentTarget as HTMLElement, 0);

  // Keyboard: tabbing to a phone scrolls the page so that phone is centred.
  const onFocus = (e: FocusEvent) => {
    const link = e.target as HTMLElement;
    const item = link.closest<HTMLElement>(ITEM);
    const i = item ? vis.indexOf(item) : -1;
    const st = tween.scrollTrigger;
    if (i < 0 || !st || !link.matches(":focus-visible")) return;
    const p = geo.travel > 0 ? clamp((geo.first + i * GAP - W / 2) / geo.travel, 0, 1) : 0;
    window.scrollTo(0, st.start + p * (st.end - st.start));
  };

  const items = allItems();
  items.forEach((el) => {
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
  });
  track.addEventListener("focusin", onFocus);

  ctrl.current = {
    relayout: () => {
      measure();
      render();
    },
    frameLoaded: (frame) => {
      lastScroll.delete(frame);
      render();
    },
  };

  return () => {
    ctrl.current = null;
    onNear.delete(render);
    items.forEach((el) => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    });
    track.removeEventListener("focusin", onFocus);
    gsap.killTweensOf([...hover.values()]);
    // render() runs from callbacks outside the context; clear what it set.
    gsap.set([stage, track, bar, ...items.map(phoneOf)], { clearProps: "all" });
  };
}
