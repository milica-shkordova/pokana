import {
  findPlaceholders,
  isBlank,
  timeAgo,
  type EventDetail,
  type Locale,
  type MediaItem,
  type PublicEvent,
  type ResolvedMedia,
  type Rsvp,
  type SectionKind,
  type SectionState,
} from "@pokanito/shared";
import type { SaveState } from "./useEventEditor";
import type { DotTone } from "./types";

export const toResolved = (m: MediaItem): ResolvedMedia => ({
  id: m.id,
  kind: m.kind,
  url: m.url,
  srcSet: m.srcSet,
  width: m.width,
  height: m.height,
  focalX: m.focalX,
  focalY: m.focalY,
  alt: m.alt,
  durationSec: m.durationSec,
});

/** The event as the public site will render it — pushed into the preview iframe. */
export function buildPreviewEvent(draft: EventDetail, library: MediaItem[], sections: SectionState[]): PublicEvent {
  const ids = new Set<string>([
    ...(Object.values(draft.content.photos ?? {}).filter(Boolean) as string[]),
    ...(draft.content.gallery?.photos ?? []),
    ...((draft.content.people?.items ?? []).map((p) => p.photo).filter(Boolean) as string[]),
    ...(draft.content.music?.mediaId ? [draft.content.music.mediaId] : []),
  ]);
  const media = Object.fromEntries(library.filter((m) => ids.has(m.id)).map((m) => [m.id, toResolved(m)]));
  return {
    id: draft.id,
    slug: draft.slug,
    templateId: draft.templateId,
    name: draft.name,
    eventDate: draft.eventDate,
    languages: draft.languages,
    content: draft.content,
    theme: draft.theme,
    sections,
    rsvpDeadline: draft.rsvpDeadline,
    rsvpOpen: true,
    media,
    noindex: draft.noindex,
    isDemo: draft.isDemo,
    preview: true,
  };
}

/** Autosave status line under the event name. */
export const saveLabel = (saveState: SaveState, savedAt: number | null) =>
  saveState === "saving"
    ? "Saving…"
    : saveState === "dirty"
      ? "Unsaved changes"
      : saveState === "error"
        ? "Couldn't save"
        : savedAt
          ? `Saved ${timeAgo(savedAt)}`
          : "";

/** "Ана" + "Марко" → "Ана & Марко", per language. */
export function joinNames(
  a: Record<string, string | undefined> | undefined,
  b: Record<string, string | undefined> | undefined,
  langs: Locale[],
) {
  return Object.fromEntries(
    langs.map((l) => [l, [a?.[l], b?.[l]].filter(Boolean).join(" & ")]),
  );
}

/** Dot tone and short status ("done", count, "needs info") of a section in the nav. */
export function sectionStatus(e: EventDetail, id: SectionKind, enabled: boolean): { tone: DotTone; meta: string } {
  if (!enabled) return { tone: "off", meta: "off" };
  const c = e.content;
  const ph = (v: unknown) => findPlaceholders(v).length > 0;
  const warn = { tone: "warn" as const, meta: "needs info" };
  switch (id) {
    case "welcome":
      return isBlank(c.welcome?.text) || ph(c.welcome) ? warn : { tone: "ok", meta: "done" };
    case "program":
      return !c.program?.items.length || ph(c.program) ? warn : { tone: "ok", meta: String(c.program.items.length) };
    case "info":
      return !c.info?.items.length || ph(c.info) ? warn : { tone: "ok", meta: String(c.info.items.length) };
    case "people":
      return !c.people?.items.length || ph(c.people) ? warn : { tone: "ok", meta: String(c.people.items.length) };
    case "godparents":
      return isBlank(c.godparents?.names) || ph(c.godparents) ? warn : { tone: "ok", meta: "done" };
    case "gallery":
      return !c.gallery?.photos.length ? warn : { tone: "ok", meta: String(c.gallery.photos.length) };
    case "rsvp":
      return !e.rsvpDeadline || !e.rsvpEmails.length ? warn : { tone: "ok", meta: "on" };
    case "location":
      return !c.location?.venues.length || ph(c.location) ? warn : { tone: "ok", meta: String(c.location.venues.length) };
    case "music":
      return !c.music?.mediaId ? warn : { tone: "ok", meta: "on" };
    case "footer":
      return ph(c.footer) ? warn : { tone: "ok", meta: "done" };
    case "countdown":
      return { tone: "ok", meta: "on" };
  }
}

/** Reply counts for the Replies card: coming, guests, menu choices, undelivered emails. */
export function replyTotals(rsvps: Rsvp[]) {
  const attending = rsvps.filter((r) => r.attending);
  const guests = attending.reduce((s, r) => s + r.totalGuests, 0);
  const menus = attending
    .flatMap((r) => r.guests)
    .reduce<Record<string, number>>((acc, g) => (g.menu ? { ...acc, [g.menu]: (acc[g.menu] ?? 0) + 1 } : acc), {});
  const failed = rsvps.filter((r) => r.emailError && !r.emailedAt).length;
  return { attending, guests, menus, failed };
}
