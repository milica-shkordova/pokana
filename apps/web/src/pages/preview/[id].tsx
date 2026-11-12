import type { GetServerSideProps } from "next";
import { ApiError, type PublicEvent } from "@pokanito/shared";
import InvitationView from "@/components/invitation/InvitationView";
import { usePreviewBridge } from "@/components/invitation/hooks/usePreviewBridge";
import { serverPublicApi } from "@/lib/api";

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
  const event = usePreviewBridge(initial, embed);

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
