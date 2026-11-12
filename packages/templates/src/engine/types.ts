import type {
  EventContent,
  Locale,
  RsvpMode,
  SectionKind,
  SectionState,
  TemplateCategory,
} from "@pokanito/shared";
import type { UiStrings } from "./strings";

// React-free description of a template. The API (validation, seeding,
// checklist), the admin (editor forms, swatches, photo slots) and the public
// site all read this; only the public site and previews load the components.

export interface PhotoSlot {
  id: string;
  label: string;
  /** "4:5", "16:9", "1:1" — used for crop previews in the editor. */
  aspect: string;
  required: boolean;
}

/** A per-event colour lever with preset swatches (from the design's data-props). */
export interface ThemeOption {
  key: string;
  label: string;
  default: string;
  options: string[];
}

export interface SectionDef {
  id: SectionKind;
  /** Editor label, e.g. "Agenda" for a corporate `program`, "What awaits" for kids. */
  label: string;
  defaultEnabled: boolean;
  /** Can't be switched off (e.g. RSVP on most templates is optional, location usually isn't). */
  required?: boolean;
}

export interface TemplateDefinition {
  /** Registry key and DB id, e.g. "elegant-wedding". */
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  /** One-line summary for gallery cards. */
  tagline: string;
  /** Placeholder thumbnail when no preview photo exists (cards, admin grid). */
  thumb: { bg: string; ink: string; font: string; mono: string };
  /** Google Fonts stylesheet (must include Cyrillic) + family names. */
  fonts: { href: string; heading: string; body: string };
  sections: SectionDef[];
  photoSlots: PhotoSlot[];
  themeOptions: ThemeOption[];
  rsvpMode: RsvpMode;
  defaultLanguages: Locale[];
  /** Starting content for new events and the demo. `[Placeholders]` must be replaced before publishing. */
  defaultContent: EventContent;
  /** Seeds the public demo invitation. */
  demo: {
    slug: string;
    name: string;
    /** YYYY-MM-DD and HH:mm, Skopje time. */
    date: string;
    time: string;
    languages?: Locale[];
    /** Overrides merged over defaultContent (the demo must not show [placeholders]). */
    content?: Partial<EventContent>;
    theme?: Record<string, string>;
    /** Photo slot → file name in apps/api/prisma/seed-assets/. */
    photos?: Record<string, string>;
    /** File name in seed-assets for background music. */
    music?: string;
  };
  strings?: Partial<Record<Locale, Partial<UiStrings>>>;
}

export function defaultSections(def: TemplateDefinition): SectionState[] {
  return def.sections.map((s) => ({ id: s.id, enabled: s.defaultEnabled }));
}

export function defaultTheme(def: TemplateDefinition): Record<string, string> {
  return Object.fromEntries(def.themeOptions.map((o) => [o.key, o.default]));
}

/**
 * Sections to render, in the event's order, limited to what the template
 * supports. New template sections the event doesn't know about yet are
 * appended with their default state.
 */
export function resolveSections(def: TemplateDefinition, stored: SectionState[] | undefined): SectionState[] {
  const known = new Set(def.sections.map((s) => s.id));
  const out = (stored ?? []).filter((s) => known.has(s.id));
  for (const s of def.sections) {
    if (!out.some((o) => o.id === s.id)) out.push({ id: s.id, enabled: s.defaultEnabled });
  }
  return out.map((s) => (def.sections.find((d) => d.id === s.id)?.required ? { ...s, enabled: true } : s));
}
