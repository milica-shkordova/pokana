import { useCallback } from "react";
import Head from "next/head";
import { eventUrl, formatEventDate, ogImageUrl, type Locale, type PublicEvent, type RsvpInput } from "@pokanito/shared";
import { Invitation } from "@pokanito/templates";
import { templateDefinitions } from "@pokanito/templates/definitions";
import { publicApi, SITE_URL } from "@/lib/api";

/** Fonts, title, robots and link-preview tags for an invitation page. */
export function InvitationHead({
  templateId,
  title,
  slug,
  eventDate,
  locale,
  noindex,
  preview,
}: {
  templateId: string;
  title: string;
  slug: string;
  eventDate: string;
  locale: Locale;
  noindex: boolean;
  preview?: boolean;
}) {
  const fonts = templateDefinitions[templateId]?.fonts.href;
  const description = formatEventDate(eventDate, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const url = eventUrl(SITE_URL, slug);
  return (
    <Head>
      <title>{preview ? `[Preview] ${title}` : title}</title>
      {fonts && <link rel="stylesheet" href={fonts} />}
      {(noindex || preview) && <meta name="robots" content="noindex, nofollow" />}
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImageUrl(SITE_URL, slug)} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}

interface Props {
  event: PublicEvent;
  /** Proof the guest entered the access code (locked invitations). */
  unlockToken?: string | null;
}

/** Renders an invitation with its template and wires its RSVP form to the API. */
export default function InvitationView({ event, unlockToken }: Props) {
  const submitRsvp = useCallback(
    async (input: RsvpInput) => {
      if (event.preview) {
        await new Promise((r) => setTimeout(r, 400)); // previews never post
        return;
      }
      // 201 = stored, 202 = demo (accepted, not stored). Anything else throws
      // an ApiError, which the template turns into its error message.
      await publicApi.rsvp(event.slug, input, unlockToken);
    },
    [event.slug, event.preview, unlockToken],
  );

  return (
    <>
      <InvitationHead
        templateId={event.templateId}
        title={event.name}
        slug={event.slug}
        eventDate={event.eventDate}
        locale={event.languages[0] ?? "mk"}
        noindex={event.noindex}
        preview={event.preview}
      />
      <Invitation event={event} submitRsvp={submitRsvp} />
    </>
  );
}
