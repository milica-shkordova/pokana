import type { MediaItem } from "@pokanito/shared";

export type TypeTab = "all" | "photo" | "audio" | "unused";

/** One event's files (or the shared template files) in the library grid. */
export interface MediaGroup {
  key: string;
  eventId: string | null;
  title: string;
  items: MediaItem[];
}

/** A delete the API refused because the file is in use (409), awaiting "Delete anyway". */
export interface InUseConfirm {
  item: MediaItem;
  message: string;
}
