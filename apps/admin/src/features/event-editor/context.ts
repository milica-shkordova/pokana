import type { EventContent, EventDetail, Locale, MediaItem, MediaKind } from "@pokanito/shared";
import type { TemplateDefinition } from "@pokanito/templates/definitions";
import type { EventEditor } from "./useEventEditor";

/** What every editor form receives. */
export interface FormProps {
  event: EventDetail;
  def: TemplateDefinition;
  languages: Locale[];
  update: EventEditor["update"];
  updateContent: EventEditor["updateContent"];
  /** All media (for thumbnails / pickers). */
  library: MediaItem[];
  mediaById: (id: string | null | undefined) => MediaItem | undefined;
  addToLibrary: (items: MediaItem[]) => void;
  /** Opens the media picker; resolves via the callback. */
  pick: (kind: MediaKind, onPick: (item: MediaItem) => void, title?: string) => void;
}

/** What each section form receives (the section's label from the layout). */
export type SectionFormProps = FormProps & { label: string };

export type ContentKey = keyof EventContent;

/** Shorthand to set one content key. */
export const setContent =
  <K extends ContentKey>(updateContent: FormProps["updateContent"], key: K) =>
  (value: EventContent[K]) =>
    updateContent((c) => ({ ...c, [key]: value }));
