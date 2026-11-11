import { createContext, useContext, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  formatEventDate,
  pickText,
  type Locale,
  type LocalizedText,
  type PublicEvent,
  type ResolvedMedia,
  type RsvpInput,
  type SectionKind,
} from "@momentelo/shared";
import { baseStrings, type UiStrings } from "./strings";
import { resolveSections, type TemplateDefinition } from "./types";

// Everything a template needs at render time. The host app (public site,
// preview) creates it with <InvitationProvider>; templates read it with
// useInvitation(). Templates never fetch or know about URLs.

export type SubmitRsvp = (input: RsvpInput) => Promise<void>;

export interface InvitationContextValue {
  event: PublicEvent;
  def: TemplateDefinition;
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Guest-facing text in the current locale. */
  t: (text: LocalizedText | undefined | null) => string;
  /** Fixed UI copy in the current locale. */
  s: UiStrings;
  /** The event date in Skopje time, formatted for the current locale. */
  date: (options?: Intl.DateTimeFormatOptions) => string;
  media: (id: string | null | undefined) => ResolvedMedia | null;
  photo: (slotId: string) => ResolvedMedia | null;
  /** Enabled section ids in render order. */
  sections: SectionKind[];
  has: (section: SectionKind) => boolean;
  /** CSS variables for the event's theme: --theme-<key>. */
  themeStyle: CSSProperties;
  theme: Record<string, string>;
  submitRsvp: SubmitRsvp;
  preview: boolean;
  /** Embedded in another page (landing gallery): no splash, no music. */
  embed: boolean;
}

const Ctx = createContext<InvitationContextValue | null>(null);

interface ProviderProps {
  event: PublicEvent;
  def: TemplateDefinition;
  submitRsvp: SubmitRsvp;
  initialLocale?: Locale;
  children: ReactNode;
}

export function InvitationProvider({ event, def, submitRsvp, initialLocale, children }: ProviderProps) {
  const [chosen, setLocale] = useState<Locale>(initialLocale ?? event.languages[0] ?? "mk");
  const locale = event.languages.includes(chosen) ? chosen : (event.languages[0] ?? "mk");

  const value = useMemo<InvitationContextValue>(() => {
    const s = { ...baseStrings[locale], ...def.strings?.[locale] };
    const theme = { ...Object.fromEntries(def.themeOptions.map((o) => [o.key, o.default])), ...event.theme };
    const sections = resolveSections(def, event.sections)
      .filter((x) => x.enabled)
      .map((x) => x.id);
    const media = (id: string | null | undefined) => (id ? (event.media[id] ?? null) : null);
    return {
      event,
      def,
      locale,
      setLocale,
      t: (text) => pickText(text, locale),
      s,
      date: (options) => formatEventDate(event.eventDate, locale, options),
      media,
      photo: (slotId) => media(event.content.photos?.[slotId]),
      sections,
      has: (k) => sections.includes(k),
      theme,
      themeStyle: Object.fromEntries(Object.entries(theme).map(([k, v]) => [`--theme-${k}`, v])) as CSSProperties,
      submitRsvp,
      preview: !!event.preview,
      embed: !!event.embed,
    };
  }, [event, def, locale, submitRsvp]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useInvitation(): InvitationContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useInvitation() must be used inside <InvitationProvider>");
  return ctx;
}

/** Replaces "{date}" style tokens in UI strings. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");
}
