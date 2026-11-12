import { useEffect, useState } from "react";
import type { PublicEvent } from "@pokanito/shared";
import { publicApi } from "@/lib/api";

/** `?preview=TOKEN`: fetches the client-approval preview of `slug` (client-side). */
export function usePreviewEvent(slug: string, token: string) {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    publicApi
      .eventPreview(slug, token)
      .then((e) => !cancelled && setEvent({ ...e, preview: true }))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [slug, token]);
  return { event, failed };
}
