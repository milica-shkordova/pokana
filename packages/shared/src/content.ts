import { z } from "zod";
import { RSVP_MODES, SECTION_KINDS, type Locale, type RsvpMode, type SectionKind } from "./constants";

// ── The content model every template renders ────────────────────────────────
//
// One shape for all templates: each template uses the parts it needs and
// declares (in its definition) which sections, photo slots and theme options
// it has. Guest-facing text is stored per locale.

export type LocalizedText = Partial<Record<Locale, string>>;

export const localizedText = z
  .object({ mk: z.string().max(4000).optional(), en: z.string().max(4000).optional() })
  .strict() satisfies z.ZodType<LocalizedText>;

const id = z.string().min(1).max(64);
const mediaId = z.string().min(1).max(64);

export const programItemSchema = z.object({
  id,
  time: z.string().max(40).default(""),
  title: localizedText,
  place: localizedText.optional(),
  note: localizedText.optional(),
});
export type ProgramItem = z.infer<typeof programItemSchema>;

export const infoItemSchema = z.object({
  id,
  label: localizedText,
  title: localizedText,
  text: localizedText.optional(),
});
export type InfoItem = z.infer<typeof infoItemSchema>;

export const personSchema = z.object({
  id,
  name: localizedText,
  role: localizedText.optional(),
  photo: mediaId.nullish(),
});
export type Person = z.infer<typeof personSchema>;

export const venueSchema = z.object({
  id,
  /** Button label when there are several venues, e.g. "До црквата". */
  label: localizedText.optional(),
  name: localizedText,
  address: localizedText,
  /** Free-text query for the map embed and the "open in maps" link. */
  mapsQuery: z.string().max(300).default(""),
  note: localizedText.optional(),
});
export type Venue = z.infer<typeof venueSchema>;

export const rsvpConfigSchema = z.object({
  mode: z.enum(RSVP_MODES),
  heading: localizedText.optional(),
  note: localizedText.optional(),
  /** guests-with-menu / plain menu choice. */
  menuOptions: z.array(z.string().max(80)).max(12).default([]),
  askAllergies: z.boolean().default(false),
  askMessage: z.boolean().default(false),
});
export type RsvpConfig = z.infer<typeof rsvpConfigSchema>;

export const eventContentSchema = z.object({
  /** The headline: "Ана & Марко", "Лука", "Елена", "Nova". */
  names: localizedText,
  /** Weddings: the two names separately (some layouts stack them). */
  partnerOne: localizedText.optional(),
  partnerTwo: localizedText.optional(),
  /** Small line above the names: "Се венчаваме", "PRODUCT LAUNCH · 2027". */
  eyebrow: localizedText.optional(),
  /** Sub-headline / intro under the names (corporate). */
  tagline: localizedText.optional(),
  /** Milestone / kids birthdays. */
  age: z.number().int().min(0).max(150).optional(),
  /** Host line: parents, company, "мама Ивана · 070 123 456". */
  organizer: localizedText.optional(),
  /** City shown next to the date, e.g. "Скопје". */
  city: localizedText.optional(),

  welcome: z.object({ heading: localizedText.optional(), text: localizedText, signature: localizedText.optional() }).optional(),
  countdown: z.object({ heading: localizedText.optional() }).optional(),
  program: z.object({ heading: localizedText.optional(), items: z.array(programItemSchema).max(30) }).optional(),
  info: z.object({ heading: localizedText.optional(), items: z.array(infoItemSchema).max(12) }).optional(),
  people: z.object({ heading: localizedText.optional(), items: z.array(personSchema).max(24) }).optional(),
  godparents: z.object({ heading: localizedText.optional(), names: localizedText }).optional(),
  gallery: z.object({ heading: localizedText.optional(), photos: z.array(mediaId).max(40) }).optional(),
  rsvp: rsvpConfigSchema.optional(),
  location: z.object({ heading: localizedText.optional(), venues: z.array(venueSchema).max(6) }).optional(),
  music: z.object({ mediaId: mediaId.nullish(), title: z.string().max(200).optional() }).optional(),
  footer: z.object({ text: localizedText.optional(), contact: localizedText.optional() }).optional(),

  /** Photo slot id (declared by the template) → media id. */
  photos: z.record(z.string(), mediaId.nullable()).default({}),
});
export type EventContent = z.infer<typeof eventContentSchema>;

export const sectionStateSchema = z.object({ id: z.enum(SECTION_KINDS), enabled: z.boolean() });
export type SectionState = z.infer<typeof sectionStateSchema>;

export const themeSchema = z.record(z.string().max(40), z.string().max(40));
export type EventTheme = z.infer<typeof themeSchema>;

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Text in the requested locale, falling back to any other filled locale. */
export function pickText(text: LocalizedText | undefined | null, locale: Locale): string {
  if (!text) return "";
  return text[locale] ?? Object.values(text).find((v) => v && v.trim()) ?? "";
}

export const isBlank = (text: LocalizedText | undefined | null, locale?: Locale) =>
  locale ? !text?.[locale]?.trim() : !Object.values(text ?? {}).some((v) => v?.trim());

/** Same text in every locale — handy for seed data and defaults. */
export const same = (value: string, locales: readonly Locale[] = ["mk", "en"]): LocalizedText =>
  Object.fromEntries(locales.map((l) => [l, value]));

/** "[Venue]", "[Име]" — owner-supplied placeholders that must be replaced before publishing. */
export const PLACEHOLDER_RE = /\[[^\]\n]{1,40}\]/;

/** Finds placeholder text anywhere in the content (for the publish checklist). */
export function findPlaceholders(value: unknown, path = ""): { path: string; text: string }[] {
  if (typeof value === "string") {
    const m = value.match(PLACEHOLDER_RE);
    return m ? [{ path, text: m[0] }] : [];
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => findPlaceholders(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => findPlaceholders(v, path ? `${path}.${k}` : k));
  }
  return [];
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export type { RsvpMode, SectionKind };
