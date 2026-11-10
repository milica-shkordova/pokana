import type { Event, Media, Prisma } from "@prisma/client";
import {
  EVENT_TIMEZONE,
  utcToZoned,
  zonedToUtc,
  type EventContent,
  type EventDetail,
  type EventStatus,
  type EventSummary,
  type EventTheme,
  type Locale,
  type PublicEvent,
  type PublicEventMeta,
  type SectionState,
  type Settings,
} from "@momentelo/shared";
import {
  defaultSections,
  defaultTheme,
  getDefinition,
  getPublishChecklist,
  resolveSections,
  type TemplateDefinition,
} from "@momentelo/templates/definitions";
import { db } from "../db";
import { resolveMedia, thumbUrl } from "./media";
import { ValidationError } from "./http";

type EventWithExtras = Event & {
  _count?: { rsvps: number };
  attendingGuests?: number;
  heroMedia?: Media | null;
  /** Catalog variant the event was created from (name/category shown instead of the layout's). */
  variant?: { name: string; category: string } | null;
};

const json = <T>(v: unknown, fallback: T): T => (v ?? fallback) as T;

export const eventLanguages = (e: Event) => json<Locale[]>(e.languages, ["mk"]);
export const eventContent = (e: Event) => json<EventContent>(e.content, { names: {}, photos: {} });
export const eventSections = (e: Event) => json<SectionState[]>(e.sections, []);
export const eventEmails = (e: Event) => json<string[]>(e.rsvpEmails, []);

// ── Status ──────────────────────────────────────────────────────────────────

/** Start of today in Skopje, as a UTC Date. */
export function startOfTodaySkopje(now = new Date()): Date {
  return new Date(zonedToUtc(utcToZoned(now.toISOString(), EVENT_TIMEZONE).date, "00:00"));
}

/** Live events become past the day after the event. */
export function isPastDate(eventDate: Date, now = new Date()) {
  const eventDay = new Date(zonedToUtc(utcToZoned(eventDate.toISOString()).date, "00:00"));
  return eventDay < startOfTodaySkopje(now);
}

export function computeExpiresAt(eventDate: Date, keepOnlineMonths: number): Date | null {
  if (!keepOnlineMonths) return null;
  const d = new Date(eventDate);
  d.setUTCMonth(d.getUTCMonth() + keepOnlineMonths);
  return d;
}

/** Whether guests can open the invitation link (an archived one only if kept online). */
export function isViewable(e: Pick<Event, "status" | "archivedOnline">) {
  return e.status === "live" || e.status === "past" || (e.status === "archived" && e.archivedOnline);
}

export function rsvpOpen(e: Event, now = new Date()) {
  if (e.status === "past" || e.status === "archived" || isPastDate(e.eventDate, now)) return false;
  return !e.rsvpDeadline || e.rsvpDeadline.getTime() + 24 * 3600_000 > now.getTime(); // open through the deadline day
}

// ── Serialization ───────────────────────────────────────────────────────────

export function toEventSummary(e: EventWithExtras): EventSummary {
  const def = getDefinition(e.templateId);
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    templateId: e.templateId,
    variantId: e.variantId,
    templateName: e.variant?.name ?? def?.name ?? e.templateId,
    category: (e.variant?.category as EventSummary["category"]) ?? def?.category ?? null,
    clientName: e.clientName,
    status: e.status as EventStatus,
    archivedOnline: e.archivedOnline,
    eventDate: e.eventDate.toISOString(),
    languages: eventLanguages(e),
    rsvpCount: e._count?.rsvps ?? 0,
    attendingGuests: e.attendingGuests ?? 0,
    expectedGuests: e.expectedGuests,
    thumbUrl: e.heroMedia ? thumbUrl(e.heroMedia) : null,
    isDemo: e.isDemo,
    isDefaults: e.isDefaults,
    publishedAt: e.publishedAt?.toISOString() ?? null,
    updatedAt: e.updatedAt.toISOString(),
  };
}

export function toEventDetail(e: EventWithExtras): EventDetail {
  const def = getDefinition(e.templateId);
  return {
    ...toEventSummary(e),
    clientContact: e.clientContact,
    content: eventContent(e),
    theme: json<EventTheme>(e.theme, {}),
    sections: def ? resolveSections(def, eventSections(e)) : eventSections(e),
    rsvpEmails: eventEmails(e),
    rsvpDeadline: e.rsvpDeadline?.toISOString() ?? null,
    rsvpTestedAt: e.rsvpTestedAt?.toISOString() ?? null,
    accessCode: e.accessCode,
    noindex: e.noindex,
    clientApproved: e.clientApproved,
    expiresAt: e.expiresAt?.toISOString() ?? null,
    leadId: e.leadId,
    createdAt: e.createdAt.toISOString(),
  };
}

export function toPublicMeta(e: Event): PublicEventMeta {
  return {
    slug: e.slug,
    name: e.name,
    templateId: e.templateId,
    eventDate: e.eventDate.toISOString(),
    languages: eventLanguages(e),
    noindex: e.noindex,
  };
}

/** Every media id the content references, with the slot it's used in. */
export function mediaRefs(content: EventContent): { mediaId: string; slot: string }[] {
  const refs: { mediaId: string; slot: string }[] = [];
  for (const [slot, id] of Object.entries(content.photos ?? {})) if (id) refs.push({ mediaId: id, slot: `photo:${slot}` });
  for (const p of content.people?.items ?? []) if (p.photo) refs.push({ mediaId: p.photo, slot: `person:${p.id}` });
  (content.gallery?.photos ?? []).forEach((id, i) => refs.push({ mediaId: id, slot: `gallery:${i}` }));
  if (content.music?.mediaId) refs.push({ mediaId: content.music.mediaId, slot: "music" });
  return refs;
}

export async function toPublicEvent(e: Event, opts: { preview?: boolean } = {}): Promise<PublicEvent> {
  const content = eventContent(e);
  const ids = [...new Set(mediaRefs(content).map((r) => r.mediaId))];
  const media = ids.length ? await db.media.findMany({ where: { id: { in: ids } } }) : [];
  const def = getDefinition(e.templateId);
  return {
    id: e.id,
    slug: e.slug,
    templateId: e.templateId,
    name: e.name,
    eventDate: e.eventDate.toISOString(),
    languages: eventLanguages(e),
    content,
    theme: json<EventTheme>(e.theme, {}),
    sections: def ? resolveSections(def, eventSections(e)) : eventSections(e),
    rsvpDeadline: e.rsvpDeadline?.toISOString() ?? null,
    rsvpOpen: rsvpOpen(e),
    media: Object.fromEntries(media.map((m) => [m.id, resolveMedia(m)])),
    noindex: e.noindex,
    isDemo: e.isDemo,
    preview: opts.preview || undefined,
  };
}

/** Adds RSVP counts and hero thumbnails to a list of events (two queries total). */
export async function withListExtras<T extends Event & { _count?: { rsvps: number } }>(rows: T[]) {
  const ids = rows.map((r) => r.id);
  const sums = ids.length
    ? await db.rsvp.groupBy({ by: ["eventId"], where: { eventId: { in: ids }, attending: true }, _sum: { totalGuests: true } })
    : [];
  const heroIds = rows.map((r) => eventContent(r).photos?.hero ?? Object.values(eventContent(r).photos ?? {}).find(Boolean)).filter(Boolean) as string[];
  const heroes = heroIds.length ? await db.media.findMany({ where: { id: { in: heroIds } } }) : [];
  const variantIds = [...new Set(rows.map((r) => r.variantId).filter(Boolean))] as string[];
  const variants = variantIds.length ? await db.template.findMany({ where: { id: { in: variantIds } }, select: { id: true, name: true, category: true } }) : [];
  return rows.map((r) => {
    const content = eventContent(r);
    const heroId = content.photos?.hero ?? Object.values(content.photos ?? {}).find(Boolean);
    return {
      ...r,
      attendingGuests: sums.find((s) => s.eventId === r.id)?._sum.totalGuests ?? 0,
      heroMedia: heroes.find((m) => m.id === heroId) ?? null,
      variant: variants.find((v) => v.id === r.variantId) ?? null,
    };
  });
}

// ── Writes ──────────────────────────────────────────────────────────────────

/** Rebuilds MediaUsage rows from the event content ("Used in" / "Unused"). */
export async function syncMediaUsage(eventId: string, content: EventContent) {
  const refs = mediaRefs(content);
  const existing = refs.length ? await db.media.findMany({ where: { id: { in: refs.map((r) => r.mediaId) } }, select: { id: true } }) : [];
  const valid = refs.filter((r) => existing.some((m) => m.id === r.mediaId));
  await db.$transaction([
    db.mediaUsage.deleteMany({ where: { eventId } }),
    ...(valid.length ? [db.mediaUsage.createMany({ data: valid.map((r) => ({ ...r, eventId })) })] : []),
  ]);
}

const slugify = (text: string) => {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", ѓ: "gj", е: "e", ж: "zh", з: "z", ѕ: "dz", и: "i", ј: "j",
    к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o", п: "p", р: "r", с: "s", т: "t", ќ: "kj",
    у: "u", ф: "f", х: "h", ц: "c", ч: "ch", џ: "dzh", ш: "sh",
  };
  return (
    text
      .toLowerCase()
      .split("")
      .map((ch) => map[ch] ?? ch)
      .join("")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/&/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "event"
  );
};

export async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  const root = slugify(base);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const taken = await db.event.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!taken || taken.id === exceptId) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** Starting state for a new event, combining the template defaults and Settings › Invitation defaults. */
export function newEventData(def: TemplateDefinition, settings: Settings, eventDate: Date) {
  const content = clone(def.defaultContent);
  if (content.rsvp && content.rsvp.mode === "guests-with-menu" && settings.defaultMenuOptions.length) {
    content.rsvp.menuOptions = [...settings.defaultMenuOptions];
  }
  const languages: Locale[] =
    settings.defaultLanguage === "both" ? ["mk", "en"] : [settings.defaultLanguage as Locale];
  const deadline = new Date(eventDate.getTime() - settings.defaultRsvpDeadlineDays * 86_400_000);
  return {
    templateId: def.id,
    languages,
    content: content as unknown as Prisma.InputJsonValue,
    theme: defaultTheme(def),
    sections: defaultSections(def) as unknown as Prisma.InputJsonValue,
    rsvpEmails: [] as string[],
    rsvpDeadline: settings.defaultRsvpDeadlineDays ? deadline : null,
    noindex: settings.defaultNoindex,
    accessCode: settings.defaultPassword ? String(Math.floor(1000 + Math.random() * 9000)) : null,
  };
}

/** Publish gate: the checklist must pass and the content must be complete. */
export function assertPublishable(e: Event) {
  const def = getDefinition(e.templateId);
  if (!def) throw new ValidationError([{ path: "templateId", message: "This template isn't implemented yet" }], "Can't publish");
  const checklist = getPublishChecklist(
    {
      name: e.name,
      eventDate: e.eventDate.toISOString(),
      languages: eventLanguages(e),
      content: eventContent(e),
      sections: eventSections(e),
      rsvpEmails: eventEmails(e),
      rsvpTestedAt: e.rsvpTestedAt?.toISOString() ?? null,
      rsvpDeadline: e.rsvpDeadline?.toISOString() ?? null,
      clientApproved: e.clientApproved,
    },
    def,
  );
  const failing = checklist.filter((c) => !c.ok);
  if (failing.length) {
    throw new ValidationError(
      failing.map((c) => ({ path: `checklist.${c.id}`, message: c.label })),
      "Not ready to publish yet",
    );
  }
}
