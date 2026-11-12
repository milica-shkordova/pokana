import type { CSSProperties } from "react";
import { formatBytes, formatDuration, type MediaItem } from "@pokanito/shared";
import type { MediaGroup } from "./types";

/** File name as shown in the admin (seeded files carry a "seed:" prefix). */
export const fileLabel = (m: Pick<MediaItem, "fileName">) => m.fileName.replace(/^seed:/, "");

/** `object-position` that keeps a photo's focal point in frame. */
export const focalStyle = (m: Pick<MediaItem, "focalX" | "focalY">): CSSProperties => ({
  objectPosition: `${m.focalX * 100}% ${m.focalY * 100}%`,
});

/** Rounds a focal coordinate into 0–1 (3 decimals). */
export const clampFocal = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 1000) / 1000;

/** Format, size and (for photos) dimensions / phone size of a file. */
export const mediaMeta = (item: MediaItem) =>
  item.kind === "photo"
    ? `${item.mime.split("/")[1].toUpperCase().replace("JPEG", "JPG")}${item.mime.includes("heic") ? " → JPG" : ""} · ${item.width}×${item.height} · ${formatBytes(item.bytes)}${item.optimizedBytes ? ` → ${formatBytes(item.optimizedBytes)} on phones` : ""}`
    : `MP3 · ${formatDuration(item.durationSec)} · ${formatBytes(item.bytes)}`;

/** Library items grouped by event, in first-seen order (no event = shared template files). */
export function groupByEvent(items: MediaItem[]): MediaGroup[] {
  const map = new Map<string, MediaGroup>();
  for (const m of items) {
    const key = m.eventId ?? "shared";
    if (!map.has(key)) map.set(key, { key, eventId: m.eventId, title: m.eventName ?? "Shared: template defaults", items: [] });
    map.get(key)!.items.push(m);
  }
  return [...map.values()];
}

export function prettySlot(slot: string) {
  const [kind, rest] = slot.split(":");
  if (kind === "photo") return `${rest.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} photo`;
  if (kind === "gallery") return "Gallery";
  if (kind === "person") return "Speaker photo";
  if (kind === "music") return "Background music";
  return slot;
}
