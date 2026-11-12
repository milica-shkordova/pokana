import { useCallback, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// "gsap/Flip" trips TS on Windows (types/flip.d.ts vs Flip.d.ts casing); gsap is
// side-effect free, so importing from "gsap/all" still tree-shakes to Flip only.
import { Flip } from "gsap/all";
import { useGSAP } from "@gsap/react";
import { DESKTOP, ITEM, MOBILE } from "./constants";
import { createGalleryEnv } from "./galleryEnv";
import { setupDesktopMode } from "./desktopMode";
import { setupMobileMode } from "./mobileMode";
import type { Controller, Filter } from "./types";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);

interface Options {
  /** Ids of the live templates: the motion modes are rebuilt when it changes. */
  liveKey: string;
  filter: Filter;
  setFilter: (next: Filter) => void;
  requestMount: (id: string | undefined) => void;
}

/**
 * The gallery's motion (Templates.tsx): three modes via gsap.matchMedia()
 * (desktop pin, mobile carousel, reduced motion = nothing) and the Flip
 * re-flow on a tab change. Returns the refs to attach, the tab handler and
 * the demo iframes' load handler.
 */
export function useTemplateGallery({ liveKey, filter, setFilter, requestMount }: Options) {
  const root = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const ctrl = useRef<Controller | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const flipTl = useRef<gsap.core.Timeline | null>(null);

  const onFrameLoad = useCallback((frame: HTMLIFrameElement) => ctrl.current?.frameLoaded(frame), []);

  // ── Motion modes ──────────────────────────────────────────────────────────
  useGSAP(
    () => {
      const section = root.current;
      const viewport = viewportRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      const bar = barRef.current;
      if (!section || !viewport || !stage || !track || !bar) return;

      const [env, disconnectNear] = createGalleryEnv({ section, viewport, stage, track, bar }, requestMount, ctrl);

      const mm = gsap.matchMedia();

      // Desktop: pinned, scrubbed sideways row.
      mm.add(DESKTOP, () => setupDesktopMode(env));

      // Tablet / phone: native scroll-snap carousel; IntersectionObserver picks the centre phone.
      mm.add(MOBILE, () => setupMobileMode(env));

      // Reduced motion: nothing to set up; CSS renders the static grid.

      return () => {
        disconnectNear();
        mm.revert();
      };
    },
    { scope: root, dependencies: [liveKey], revertOnUpdate: true },
  );

  // ── Tab change: re-flow the phones with Flip ──────────────────────────────
  const onTab = (next: Filter) => {
    if (next === filter) return;
    const track = trackRef.current;
    if (ctrl.current && track) {
      flipTl.current?.progress(1).kill();
      flipTl.current = null;
      flipState.current = Flip.getState(track.querySelectorAll(ITEM));
    }
    setFilter(next);
  };

  useGSAP(
    () => {
      const state = flipState.current;
      flipState.current = null;
      // Re-measure first so the track sits where the new row belongs; Flip then
      // animates every phone from where it was on screen.
      ctrl.current?.relayout();
      if (!state || !ctrl.current) return;
      flipTl.current = Flip.from(state, {
        duration: 0.55,
        ease: "back.out(1.4)",
        absolute: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power2.in" }),
      });
    },
    { scope: root, dependencies: [filter] },
  );

  return { root, viewportRef, stageRef, trackRef, barRef, onTab, onFrameLoad };
}
