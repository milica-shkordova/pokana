import { useCallback, useMemo, useState } from "react";
import type { MediaItem, MediaKind, MediaLibrary } from "@pokanito/shared";
import { useResource } from "@/lib/api";
import { prependToLibrary } from "@/lib/media";
import type { PickerRequest } from "./types";

/** Media library (for thumbnails, pickers and the preview's media map) and the media picker. */
export function useEditorMedia(id: string | null) {
  const lib = useResource<MediaLibrary>(id ? "/api/admin/media" : null);
  const library = useMemo(() => lib.data?.items ?? [], [lib.data]);
  const addToLibrary = useCallback((items: MediaItem[]) => lib.mutate(prependToLibrary(items)), [lib]);
  const mediaById = useCallback((mid: string | null | undefined) => (mid ? library.find((m) => m.id === mid) : undefined), [library]);

  const [picker, setPicker] = useState<PickerRequest | null>(null);
  const pick = useCallback((kind: MediaKind, onPick: (m: MediaItem) => void, title?: string) => setPicker({ kind, onPick, title }), []);
  const closePicker = useCallback(() => setPicker(null), []);

  return { library, addToLibrary, mediaById, picker, pick, closePicker };
}
