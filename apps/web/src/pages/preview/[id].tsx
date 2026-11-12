import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import { ApiError, isPreviewMessage, PREVIEW_READY_MESSAGE, type PreviewReadyMessage, type PublicEvent } from "@pokanito/shared";
import InvitationView from "@/components/invitation/InvitationView";
import { ADMIN_ORIGIN, serverPublicApi } from "@/lib/api";

interface Props {
  event: PublicEvent;
  embed: boolean;
}

/**
 * Draft preview for the admin editor (by id, so slug edits don't break it).
 * With `embed=1` it runs inside the editor's phone frame: it tells the parent
 * it's ready, then re-renders whenever the editor posts unsaved changes:
 *   parent → iframe: { type: "pokanito:preview", event: PublicEvent }  (@pokanito/shared preview-protocol)
 * Messages from any origin other than the admin are ignored.
 */
export default function PreviewPage({ event: initial, embed }: Props) {
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

  // Remount the template when it changes so template-local state resets cleanly.
  return <InvitationView key={event.templateId} event={event} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query, res }) => {
  res.setHeader("Cache-Control", "private, no-store");
  const id = String(params?.id ?? "");
  const token = typeof query.token === "string" ? query.token : "";
  try {
    const event = await serverPublicApi.preview(id, token);
    return { props: { event: { ...event, preview: true }, embed: query.embed === "1" } };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) return { notFound: true };
    throw err;
  }
};
