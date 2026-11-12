import type { PublicEvent } from "./types";

// The admin editor shows the real template in an iframe (apps/web
// /preview/[id]?embed=1) and pushes unsaved edits into it with postMessage:
//   iframe → admin  { type: "pokanito:preview-ready", id }
//   admin  → iframe { type: "pokanito:preview", event: PublicEvent }
// Both sides check the message origin before trusting the data.

export const PREVIEW_MESSAGE = "pokanito:preview";
export const PREVIEW_READY_MESSAGE = "pokanito:preview-ready";

/** admin → iframe: render this (unsaved) event. */
export interface PreviewMessage {
  type: typeof PREVIEW_MESSAGE;
  event: PublicEvent;
}

/** iframe → admin: the template is mounted and listening. */
export interface PreviewReadyMessage {
  type: typeof PREVIEW_READY_MESSAGE;
  id?: string;
}

export function isPreviewMessage(data: unknown): data is PreviewMessage {
  const d = data as { type?: string; event?: PublicEvent } | null;
  return d?.type === PREVIEW_MESSAGE && !!d.event && typeof d.event.templateId === "string";
}

export function isPreviewReadyMessage(data: unknown): data is PreviewReadyMessage {
  return (data as { type?: string } | null)?.type === PREVIEW_READY_MESSAGE;
}
