import type { PublicSettings } from "./types";

// Domain constants shared by the API, the public site and the admin panel.

export const LOCALES = ["mk", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_LABELS: Record<Locale, string> = {
  mk: "Македонски",
  en: "English",
};

/** All event dates are entered and displayed in this zone. */
export const EVENT_TIMEZONE = "Europe/Skopje";

export const TEMPLATE_CATEGORIES = [
  "wedding",
  "birthday",
  "corporate",
  "christening",
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];
export const CATEGORY_LABELS: Record<
  TemplateCategory,
  { one: string; many: string }
> = {
  wedding: { one: "Wedding", many: "Weddings" },
  birthday: { one: "Birthday", many: "Birthdays" },
  corporate: { one: "Corporate", many: "Corporate" },
  christening: { one: "Christening", many: "Christenings" },
};

/** Drives the landing page: live → card with demo, coming-soon → chip, hidden/draft → not shown. */
export const TEMPLATE_STATUSES = [
  "live",
  "coming-soon",
  "hidden",
  "draft",
] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];
export const TEMPLATE_STATUS_LABELS: Record<TemplateStatus, string> = {
  live: "Live",
  "coming-soon": "Coming soon",
  hidden: "Hidden",
  draft: "Draft",
};

export const EVENT_STATUSES = [
  "draft",
  "in-review",
  "live",
  "past",
  "archived",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  "in-review": "In review",
  live: "Live",
  past: "Past",
  archived: "Archived",
};

export const LEAD_SOURCES = ["contact-form", "notify-me"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STAGES = [
  "new",
  "contacted",
  "preview-sent",
  "won",
  "live",
  "lost",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];
/** The visible pipeline (lost is off-pipeline). */
export const LEAD_PIPELINE: LeadStage[] = [
  "new",
  "contacted",
  "preview-sent",
  "won",
  "live",
];
export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  "preview-sent": "Preview sent",
  won: "Won",
  live: "Live",
  lost: "Lost",
};

export const USER_ROLES = ["owner", "editor"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MEDIA_KINDS = ["photo", "audio"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];
export const PHOTO_MIME = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
] as const;
export const AUDIO_MIME = ["audio/mpeg", "audio/mp3"] as const;
export type PhotoMime = (typeof PHOTO_MIME)[number];
export type AudioMime = (typeof AUDIO_MIME)[number];
/** File-input `accept` per kind (extensions too: browsers often send HEIC without a type). */
export const MEDIA_ACCEPT: Record<MediaKind, string> = {
  photo: [...PHOTO_MIME, ".heic", ".heif", ".jpg", ".jpeg", ".png"].join(","),
  audio: [AUDIO_MIME[0], ".mp3"].join(","),
};
/** Web sizes generated for every photo. */
export const PHOTO_WIDTHS = [640, 1080, 1600] as const;

/**
 * Building blocks an invitation is made of. Each template declares which of
 * these it supports (and in what order); the event stores on/off + order.
 */
export const SECTION_KINDS = [
  "welcome",
  "countdown",
  "program",
  "info",
  "people",
  "godparents",
  "gallery",
  "rsvp",
  "location",
  "music",
  "footer",
] as const;
export type SectionKind = (typeof SECTION_KINDS)[number];

/** How a template's RSVP form collects answers. */
export const RSVP_MODES = [
  "guests-with-menu", // one row per guest: name + menu (Elegant, Minimal)
  "guest-count", // name + number of guests (Rustic, Christening)
  "kids", // child's name + children + adults + allergies (Kids birthday)
  "plus-one", // name + plus one (Milestone)
  "registration", // name + company + work email + dinner (Corporate)
] as const;
export type RsvpMode = (typeof RSVP_MODES)[number];
export const RSVP_MODE_LABELS: Record<RsvpMode, string> = {
  "guests-with-menu": "One row per guest, with a menu choice",
  "guest-count": "Name + number of guests",
  kids: "Child's name, number of children and adults, allergies",
  "plus-one": "Name + plus one",
  registration: "Name, company, work email, staying for dinner",
};

// Invitations live at the root of the public site (`/<slug>`), so a slug
// must never shadow one of the site's own routes.
export const RESERVED_SLUGS = [
  "api",
  "admin",
  "preview",
  "templates",
  "pricing",
  "404",
  "500",
  "_next",
  "assets",
  "fonts",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
] as const;

/** Public business details used when the API can't be reached (landing page). */
export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  businessName: "Pokanito",
  contactEmail: "hello@pokanito.mk",
  phone: "",
  instagram: "",
  logoUrl: null,
};
