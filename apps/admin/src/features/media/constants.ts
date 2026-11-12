import type { TypeTab } from "./types";

export const TYPE_TABS: { value: TypeTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "photo", label: "Photos" },
  { value: "audio", label: "Music" },
  { value: "unused", label: "Unused" },
];

/** Focal point keyboard steps (fraction of the frame; Shift = big step). */
export const FOCAL_STEP = 0.02;
export const FOCAL_STEP_BIG = 0.1;
