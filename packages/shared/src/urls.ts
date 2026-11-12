import type { LocalizedText, Venue } from "./content";

// URLs the apps build for each other: invitation links on the public site,
// preview links, link-preview images and Google Maps.

/** "https://pokanito.mk/" → "https://pokanito.mk" (one trailing slash). */
export const trimSlash = (url: string) => url.replace(/\/$/, "");

/** "https://pokanito.mk" → "pokanito.mk" (for showing a link without its scheme). */
export const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "");

/** An absolute base URL from an env var, with its trailing slash removed. */
export const envUrl = (value: string | undefined, fallback: string) => trimSlash(value ?? fallback);

/** The public invitation: `${base}/${slug}` (`base` = the public site's origin). */
export const eventUrl = (base: string, slug: string) => `${base}/${slug}`;

/** Shareable client preview (works for drafts): `/<slug>?preview=TOKEN`. */
export const previewUrl = (base: string, slug: string, token: string) =>
  `${eventUrl(base, slug)}?preview=${encodeURIComponent(token)}`;

/** Editor live-preview iframe, by id so slug edits don't break it. */
export const embedPreviewUrl = (base: string, id: string, token: string) =>
  `${base}/preview/${id}?token=${encodeURIComponent(token)}&embed=1`;

/** Slug the landing page uses for its generic link-preview image. */
export const LANDING_OG_SLUG = "_";

/** Link-preview image (apps/web pages/api/og/[slug]). */
export const ogImageUrl = (base: string, slug: string) => `${base}/api/og/${encodeURIComponent(slug)}`;

/** "Open in Google Maps" link for a free-text query. */
export const mapsLink = (query: string) => `https://maps.google.com/?q=${encodeURIComponent(query)}`;
/** Embeddable Google Maps iframe URL for a free-text query. */
export const mapsEmbed = (query: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&z=16`;

/** The venue's maps query, falling back to "name, address" (`text` picks the locale). */
export const venueMapsQuery = (v: Venue, text: (t: LocalizedText) => string) =>
  v.mapsQuery || [text(v.name), text(v.address)].filter(Boolean).join(", ");
