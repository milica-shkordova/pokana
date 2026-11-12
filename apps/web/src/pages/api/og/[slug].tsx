import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { eventMetaOf, formatEventDate, LANDING_OG_SLUG, publicApiPaths, type PublicEventResponse } from "@pokanito/shared";
import { colors } from "@pokanito/ui/tokens";
import { API_URL } from "@/lib/api";
import { OG_LOGO, OG_LOGO_SIZE } from "@/lib/og-logo";

// Link preview image for WhatsApp / Viber / Messenger: the event's names and
// date on cream paper, signed with the Pokanito logo. Unknown slugs (and the
// landing page, which uses /api/og/_) get a generic Pokanito card.

export const config = { runtime: "edge" };

/** Loads a Google Font subset (TTF) containing just `text` — needed for Cyrillic names. */
async function loadFont(
  family: string,
  axis: string,
  text: string,
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:${axis}&text=${encodeURIComponent(text)}`;
    const css = await (
      await fetch(url, { signal: AbortSignal.timeout(4000) })
    ).text();
    const src = css.match(
      /src: url\((.+?)\) format\('(opentype|truetype)'\)/,
    )?.[1];
    if (!src) return null;
    return await (
      await fetch(src, { signal: AbortSignal.timeout(4000) })
    ).arrayBuffer();
  } catch {
    return null;
  }
}

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

  const [serif, sans] = await Promise.all([
    loadFont("Cormorant Garamond", "ital,wght@1,600", allText),
    loadFont("Manrope", "wght@600", allText),
  ]);
  const fonts = [
    ...(serif
      ? [
          {
            name: "Serif",
            data: serif,
            weight: 600 as const,
            style: "italic" as const,
          },
        ]
      : []),
    ...(sans
      ? [
          {
            name: "Sans",
            data: sans,
            weight: 600 as const,
            style: "normal" as const,
          },
        ]
      : []),
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: colors.cream,
        color: colors.ink,
        fontFamily: "Sans",
        padding: 80,
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: 26,
          letterSpacing: 6,
          color: colors.muted,
          display: "flex",
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          width: 240,
          height: 2,
          background: colors.borderDashed,
          marginTop: 28,
          display: "flex",
        }}
      />
      <div
        style={{
          fontFamily: "Serif",
          fontStyle: "italic",
          fontSize: event ? (title.length > 22 ? 86 : 110) : 76,
          lineHeight: 1.05,
          textAlign: "center",
          marginTop: 24,
          marginBottom: 24,
          maxWidth: 1000,
          display: "flex",
        }}
      >
        {title}
      </div>
      <div
        style={{
          width: 240,
          height: 2,
          background: colors.borderDashed,
          display: "flex",
        }}
      />
      <img
        src={OG_LOGO}
        alt="Pokanito"
        width={OG_LOGO_SIZE.width}
        height={OG_LOGO_SIZE.height}
        style={{ position: "absolute", bottom: 52 }}
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
