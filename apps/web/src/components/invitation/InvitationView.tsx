import Head from "next/head";
import { eventUrl, formatEventDate, ogImageUrl } from "@pokanito/shared";
import { Invitation } from "@pokanito/templates";
import { templateDefinitions } from "@pokanito/templates/definitions";
import { SITE_URL } from "@/lib/api";
import { useRsvpSubmit } from "./hooks/useRsvpSubmit";
import type { InvitationHeadProps, InvitationViewProps } from "./types";

/** Fonts, title, robots and link-preview tags for an invitation page. */
export function InvitationHead({ templateId, title, slug, eventDate, locale, noindex, preview }: InvitationHeadProps) {
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

/** Renders an invitation with its template and wires its RSVP form to the API. */
export default function InvitationView({ event, unlockToken }: InvitationViewProps) {
  const submitRsvp = useRsvpSubmit(event, unlockToken);

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
