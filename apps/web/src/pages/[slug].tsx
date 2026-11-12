import { useEffect, useState } from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { ApiError, type PublicEvent, type PublicEventMeta, type PublicEventResponse } from "@pokanito/shared";
import InvitationView from "@/components/invitation/InvitationView";
import {
  EndedView,
  forgetCode,
  LoadingView,
  LockedView,
  rememberedCode,
  unlock,
  UnpublishedView,
} from "@/components/invitation/StatePages";
import { browserApi, serverApi } from "@/lib/api";

interface Props {
  response: PublicEventResponse;
}

const metaOf = (r: PublicEventResponse): PublicEventMeta =>
  r.state === "live"
    ? {
        slug: r.event.slug,
        name: r.event.name,
        templateId: r.event.templateId,
        eventDate: r.event.eventDate,
        languages: r.event.languages,
        noindex: r.event.noindex,
      }
    : r.meta;

/** `?preview=TOKEN` — the client's approval link; works for drafts too. Fetched client-side. */
function PreviewInvitation({ meta, token }: { meta: PublicEventMeta; token: string }) {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    browserApi
      .get<PublicEvent>(`/api/public/events/${encodeURIComponent(meta.slug)}/preview?token=${encodeURIComponent(token)}`)
      .then((e) => !cancelled && setEvent({ ...e, preview: true }))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [meta.slug, token]);
  if (failed) return <UnpublishedView meta={meta} error />;
  if (!event) return <LoadingView meta={meta} />;
  return <InvitationView event={event} />;
}

/** Access-code protected invitation: remembers the code for this tab. */
function LockedInvitation({ meta }: { meta: PublicEventMeta }) {
  const [state, setState] = useState<{ event: PublicEvent; token: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const code = rememberedCode(meta.slug);
    if (!code) {
      setChecking(false);
      return;
    }
    unlock(meta.slug, code)
      .then((res) => setState(res))
      .catch(() => forgetCode(meta.slug))
      .finally(() => setChecking(false));
  }, [meta.slug]);

  if (state) return <InvitationView event={state.event} unlockToken={state.token} />;
  if (checking) return <LoadingView meta={meta} />;
  return <LockedView meta={meta} onUnlocked={(event, token) => setState({ event, token })} />;
}

export default function InvitationPage({ response }: Props) {
  const router = useRouter();
  const preview = router.isReady && typeof router.query.preview === "string" ? router.query.preview : null;
  // `?embed=1`: shown inside the landing gallery phones (no splash, no music).
  const embed = router.isReady && router.query.embed === "1";
  const meta = metaOf(response);

  if (preview) return <PreviewInvitation meta={meta} token={preview} />;

  switch (response.state) {
    case "live":
      // Keyed so the template remounts (and skips its splash) once the router
      // has read `?embed=1` after hydration.
      return (
        <InvitationView
          key={embed ? "embed" : "page"}
          event={embed ? { ...response.event, embed: true } : response.event}
        />
      );
    case "locked":
      return <LockedInvitation meta={meta} />;
    case "ended":
      return <EndedView meta={meta} />;
    case "unpublished":
      // Wait for the router before deciding: a ?preview link must not flash "not published".
      return router.isReady ? <UnpublishedView meta={meta} /> : <LoadingView meta={meta} />;
  }
}

// Invitations are generated on first request and cached (ISR). The API also
// triggers on-demand revalidation (/api/revalidate) whenever one is edited or
// published, so changes show up immediately.
export const getStaticPaths: GetStaticPaths = async () => ({ paths: [], fallback: "blocking" });

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.slug ?? "");
  try {
    const response = await serverApi.get<PublicEventResponse>(`/api/public/events/${encodeURIComponent(slug)}`);
    return { props: { response }, revalidate: 300 };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { notFound: true, revalidate: 60 };
    throw err; // keep serving the last good version if the API is down
  }
};
