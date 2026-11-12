import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { eventMetaOf, formatEventDate, LANDING_OG_SLUG, publicApiPaths, type PublicEventResponse } from "@pokanito/shared";
import { API_URL } from "@/lib/api";
import { OG_LOGO, OG_LOGO_SIZE } from "@/lib/og-logo";
import { loadOgFonts } from "@/lib/og-fonts";
import { ogStyles, ogTitleStyle } from "@/lib/og-styles";

// Link preview image for WhatsApp / Viber / Messenger: the event's names and
// date on cream paper, signed with the Pokanito logo. Unknown slugs (and the
// landing page, which uses /api/og/_) get a generic Pokanito card.

export const config = { runtime: "edge" };

async function getEvent(slug: string) {
  if (!slug || slug === LANDING_OG_SLUG) return null;
  try {
    const res = await fetch(`${API_URL}${publicApiPaths.event(slug)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as PublicEventResponse;
    if (body.state === "unpublished") return null; // don't leak drafts
    const meta = eventMetaOf(body);
    return {
      name: meta.name,
      date: meta.eventDate,
      locale: meta.languages[0] ?? "mk",
    };
  } catch {
    return null;
  }
}

export default async function handler(req: NextRequest) {
  const slug = decodeURIComponent(
    new URL(req.url).pathname.split("/").pop() ?? "",
  );
  const event = await getEvent(slug);

  const title = event?.name ?? "Invitations your guests actually want to open.";
  const subtitle = event
    ? formatEventDate(event.date, event.locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).toUpperCase()
    : "DIGITAL INVITATIONS, DONE RIGHT";
  const allText = `${title}${subtitle}0123456789`;

  const fonts = await loadOgFonts(allText);

  return new ImageResponse(
    <div style={ogStyles.card}>
      <div style={ogStyles.subtitle}>{subtitle}</div>
      <div style={ogStyles.ruleTop} />
      <div style={ogTitleStyle(event ? (title.length > 22 ? 86 : 110) : 76)}>{title}</div>
      <div style={ogStyles.rule} />
      <img
        src={OG_LOGO}
        alt="Pokanito"
        width={OG_LOGO_SIZE.width}
        height={OG_LOGO_SIZE.height}
        style={ogStyles.logo}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: fonts.length ? fonts : undefined,
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
