// Landing page copy (Landing.dc.html) in English and Macedonian. The text lives
// in locales/en.json and locales/mk.json so the owner can edit wording and fill
// in numbers without touching components. Components read it through
// `useLang()` (components/landing/i18n).
//
// TODO(owner): replace every `[PRICE]` and `[N]` (here and in the locale
// files) with real values (HANDOFF §12 open question 2). They are intentionally
// shown as-is until then. Template names and descriptions come from the admin
// (Templates screen) and are not translated here.

import type { Locale, TemplateCategory } from "@pokanito/shared";
import en from "./locales/en.json";
import mk from "./locales/mk.json";

/** The landing page languages (= the invitation locales); English first for the toggle. */
export type Lang = Locale;
export const LANGS: Lang[] = ["en", "mk"];

// ── Shared, non-text data ───────────────────────────────────────────────────
export const featureMeta = [
  { icon: "grid", tone: { bg: "#FBE6E0", fg: "#B5502F" } },
  { icon: "pen", tone: { bg: "#FCEFD9", fg: "#9A6418" } },
  { icon: "link", tone: { bg: "#E6EEE4", fg: "#4F6B53" } },
] as const;

/** Sample invitation shown in the "Inside every invitation" try-it cards. */
export const INVITE_SAMPLE = {
  /** The countdown ticks down to this moment (local time). */
  date: "2027-09-18T16:00:00",
  en: { names: "Ana & Marko", text: "Dear friends, we would love you to celebrate with us." },
  mk: { names: "Ана и Марко", text: "Драги пријатели, ве покануваме да славиме заедно." },
};

export const stepMeta = [
  { color: "#D9693F", ink: "#2A2522" },
  { color: "#E9A94F", ink: "#2A2522" },
  { color: "#EE9C92", ink: "#2A2522" },
  { color: "#9DB59A", ink: "#2A2522" },
] as const;

export const planMeta = [
  { price: "[PRICE]", featured: false },
  { price: "[PRICE]", featured: true },
] as const;

// ── Copy ───────────────────────────────────────────────────────────────────
// en.json is the reference: mk.json must have the same keys (checked by the
// `COPY` type below). Text can hold {placeholders}, filled with `fmt`, and
// counted text is a { one, other } pair, picked with `plural`.
export type Copy = typeof en;
export type PluralForms = { one: string; other: string };

// Every template category needs a label.
en.templates.categories satisfies Record<TemplateCategory, { one: string; many: string }>;

export const COPY: Record<Lang, Copy> = { en, mk };

/** Fills {placeholders} in a copy string: fmt("© {year}", { year: 2026 }). */
export function fmt(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/** Picks the plural form for `count` in `lang` and fills {count}. */
export function plural(lang: Lang, forms: PluralForms, count: number): string {
  const form = new Intl.PluralRules(lang).select(count) === "one" ? forms.one : forms.other;
  return fmt(form, { count });
}
