import type { MutableRefObject } from "react";
import type { TemplateCategory } from "@pokanito/shared";

/** The gallery tab: every template or one category. */
export type Filter = "all" | TemplateCategory;

/** What the active motion mode exposes to React (null with reduced motion). */
export interface Controller {
  /** The visible set changed (tab switch): re-measure and re-render. */
  relayout(): void;
  /** A demo iframe finished loading: re-apply its inner scroll. */
  frameLoaded(frame: HTMLIFrameElement): void;
}

/** The gallery's DOM nodes (all present once the section has rendered). */
export interface GalleryElements {
  section: HTMLElement;
  viewport: HTMLDivElement;
  stage: HTMLDivElement;
  track: HTMLDivElement;
  bar: HTMLSpanElement;
}

/** What both motion modes share (gallery/galleryEnv.ts). */
export interface GalleryEnv extends GalleryElements {
  allItems(): HTMLElement[];
  visibleItems(): HTMLElement[];
  phoneOf(item: HTMLElement): HTMLElement;
  /** True once the section is close to the viewport (demo iframes may load). */
  readonly near: boolean;
  /** Called once the section becomes near. */
  onNear: Set<() => void>;
  /** Last inner scroll applied per demo iframe. */
  lastScroll: WeakMap<HTMLIFrameElement, number>;
  scrollFrame(item: HTMLElement, screenPx: number): void;
  requestMount(id: string | undefined): void;
  ctrl: MutableRefObject<Controller | null>;
}
