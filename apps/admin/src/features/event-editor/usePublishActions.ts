import { useState } from "react";
import type { EventDetail } from "@pokanito/shared";
import { useToast, copyText, errorMessage } from "@pokanito/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { EventEditor } from "./useEventEditor";

/** Publish / unpublish and "Share preview link" (both flush unsaved edits first). */
export function usePublishActions({ draft, save, applyServer }: Pick<EventEditor, "draft" | "save" | "applyServer">) {
  const toast = useToast();
  const { refreshStats } = useSession();
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<unknown>(null);
  const [sharing, setSharing] = useState(false);

  const publish = async () => {
    if (!draft) return;
    setPublishing(true);
    setPublishError(null);
    try {
      await save();
      const res = await api.post<EventDetail>(`/api/admin/events/${draft.id}/${draft.status === "live" ? "unpublish" : "publish"}`);
      applyServer(res);
      toast(res.status === "live" || res.status === "past" ? "Published — the link is live" : "Unpublished");
      refreshStats();
    } catch (err) {
      setPublishError(err);
    } finally {
      setPublishing(false);
    }
  };

  const share = async () => {
    if (!draft) return;
    setSharing(true);
    try {
      await save();
      const { url } = await api.post<{ url: string }>(`/api/admin/events/${draft.id}/preview-link?review=1`);
      const copied = await copyText(url);
      if (draft.status === "draft") applyServer(await api.get<EventDetail>(`/api/admin/events/${draft.id}`));
      toast(copied ? "Preview link copied — send it to the client for approval" : url);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setSharing(false);
    }
  };

  return { publish, publishing, publishError, clearPublishError: () => setPublishError(null), share, sharing };
}

export type PublishActions = ReturnType<typeof usePublishActions>;
