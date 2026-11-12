import type { MediaItem, MediaLibrary } from "@pokanito/shared";
import { api } from "./api";

export async function uploadFiles(files: FileList | File[], eventId: string | null): Promise<MediaItem[]> {
  const form = new FormData();
  for (const f of Array.from(files)) form.append("file", f);
  if (eventId) form.append("eventId", eventId);
  return api.upload<MediaItem[]>("/api/admin/media", form);
}

/** Prepends freshly uploaded items to a cached library (before the reload confirms them). */
export const prependToLibrary =
  (items: MediaItem[]) =>
  (prev: MediaLibrary | undefined): MediaLibrary => ({ storage: prev?.storage ?? { usedBytes: 0, quotaBytes: 1 }, items: [...items, ...(prev?.items ?? [])] });
