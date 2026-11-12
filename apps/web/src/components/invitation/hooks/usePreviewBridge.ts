import { useEffect, useState } from "react";
import { isPreviewMessage, PREVIEW_READY_MESSAGE, type PreviewReadyMessage, type PublicEvent } from "@pokanito/shared";
import { ADMIN_ORIGIN } from "@/lib/api";

/**
 * The admin editor's live preview (pages/preview/[id]): with `embed`, tells
 * the parent frame it's ready, then returns whatever unsaved event it posts
 * (@pokanito/shared preview-protocol). Messages from any origin other than
 * the admin are ignored.
 */
export function usePreviewBridge(initial: PublicEvent, embed: boolean) {
  const [event, setEvent] = useState<PublicEvent>(initial);

  useEffect(() => setEvent(initial), [initial]);

  useEffect(() => {
    if (!embed || window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== ADMIN_ORIGIN) return;
      if (isPreviewMessage(e.data)) setEvent({ ...e.data.event, preview: true });
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY_MESSAGE, id: initial.id } satisfies PreviewReadyMessage, ADMIN_ORIGIN);
    return () => window.removeEventListener("message", onMessage);
  }, [embed, initial.id]);

  return event;
}
