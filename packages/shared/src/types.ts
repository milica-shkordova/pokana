import type {
  EventStatus,
  LeadSource,
  LeadStage,
  Locale,
  MediaKind,
  TemplateCategory,
  TemplateStatus,
  UserRole,
} from "./constants";
import type { EventContent, EventTheme, SectionState } from "./content";
import type { SettingsInput } from "./schemas";

// Response shapes returned by the API. Dates are ISO strings (JSON).

// ── Media ───────────────────────────────────────────────────────────────────

/** A media file resolved for rendering. */
export interface ResolvedMedia {
  id: string;
  kind: MediaKind;
  /** Best default URL (1080w for photos, the file for audio). */
  url: string;
  /** "url 640w, url 1080w, url 1600w" for photos. */
  srcSet?: string;
  width?: number | null;
  height?: number | null;
  focalX: number;
  focalY: number;
  alt: string;
  durationSec?: number | null;
}

export interface MediaItem extends ResolvedMedia {
  eventId: string | null;
  eventName: string | null;
  fileName: string;
  mime: string;
  bytes: number;
  optimizedBytes: number | null;
  originalUrl: string;
  thumbUrl: string;
  usedIn: { eventId: string; eventName: string; slot: string }[];
  uploadedAt: string;
}

export interface MediaLibrary {
  items: MediaItem[];
  storage: { usedBytes: number; quotaBytes: number };
}

// ── Templates ───────────────────────────────────────────────────────────────

export interface TemplateSummary {
  id: string;
  name: string;
  category: TemplateCategory;
  status: TemplateStatus;
  description: string;
  sortOrder: number;
  demoEventId: string | null;
  demoSlug: string | null;
  previewUrl: string | null;
  /** False for catalog rows whose code doesn't exist yet. */
  implemented: boolean;
  usageCount: number;
  /** Code layout this template renders with (= id unless it's a variant). */
  layoutId: string;
  isVariant: boolean;
  /** Card thumbnail: big word + optional colour overrides (null = layout colours). */
  thumb: { label: string; bg: string | null; ink: string | null };
  /** Hidden event with the content new events start from (null until first edited). */
  defaultsEventId: string | null;
}

// ── Events ──────────────────────────────────────────────────────────────────

export interface EventSummary {
  id: string;
  slug: string;
  name: string;
  /** Layout id (packages/templates) — what the invitation renders with. */
  templateId: string;
  /** Catalog template it was created from when that's a variant of the layout. */
  variantId: string | null;
  templateName: string;
  category: TemplateCategory | null;
  clientName: string;
  status: EventStatus;
  /** Archived but the invitation link still works (read-only). */
  archivedOnline: boolean;
  eventDate: string;
  languages: Locale[];
  rsvpCount: number;
  attendingGuests: number;
  expectedGuests: number | null;
  thumbUrl: string | null;
  isDemo: boolean;
  /** A template's default content (Templates › Edit defaults), never published. */
  isDefaults: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface EventDetail extends EventSummary {
  clientContact: string;
  content: EventContent;
  theme: EventTheme;
  sections: SectionState[];
  rsvpEmails: string[];
  rsvpDeadline: string | null;
  rsvpTestedAt: string | null;
  accessCode: string | null;
  noindex: boolean;
  clientApproved: boolean;
  expiresAt: string | null;
  leadId: string | null;
  createdAt: string;
}

export interface EventStats {
  live: number;
  liveThisWeek: number;
  draftsAndReview: number;
  rsvps: number;
  newLeads: number;
}

/** What the public site needs to render an invitation. */
export interface PublicEvent {
  id: string;
  slug: string;
  templateId: string;
  name: string;
  eventDate: string;
  languages: Locale[];
  content: EventContent;
  theme: EventTheme;
  sections: SectionState[];
  rsvpDeadline: string | null;
  /** False once the deadline has passed (or the event is past). */
  rsvpOpen: boolean;
  media: Record<string, ResolvedMedia>;
  noindex: boolean;
  isDemo: boolean;
  /** Rendered in a preview (RSVPs are not sent). */
  preview?: boolean;
  /** Client-only: shown inside another page (the landing gallery phones), so
   *  splash screens and music are skipped. Set by `/{slug}?embed=1`. */
  embed?: boolean;
}

/** Minimal info for the locked / ended / unpublished states. */
export interface PublicEventMeta {
  slug: string;
  name: string;
  templateId: string;
  eventDate: string;
  languages: Locale[];
  noindex: boolean;
}

export type PublicEventResponse =
  | { state: "live"; event: PublicEvent }
  | { state: "locked"; meta: PublicEventMeta }
  | { state: "ended"; meta: PublicEventMeta }
  | { state: "unpublished"; meta: PublicEventMeta };

// ── RSVPs ───────────────────────────────────────────────────────────────────

export interface RsvpGuest {
  name: string;
  menu?: string;
}

export interface Rsvp {
  id: string;
  eventId: string;
  attending: boolean;
  name: string;
  guests: RsvpGuest[];
  totalGuests: number;
  adults: number | null;
  children: number | null;
  allergies: string | null;
  message: string | null;
  extra: { company?: string; email?: string; dinner?: boolean; plusOne?: boolean };
  createdAt: string;
  emailedAt: string | null;
  emailError: string | null;
}

// ── Leads ───────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  source: LeadSource;
  name: string;
  contact: string;
  templateId: string | null;
  templateName: string | null;
  eventDate: string | null;
  guestCount: number | null;
  message: string;
  stage: LeadStage;
  unread: boolean;
  note: string | null;
  eventId: string | null;
  createdAt: string;
}

// ── Team & settings ─────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  invitedAt: string;
  acceptedAt: string | null;
}

export type CurrentUser = TeamMember;

export type Settings = SettingsInput;

export interface PublicSettings {
  businessName: string;
  contactEmail: string;
  phone: string;
  instagram: string;
  logoUrl: string | null;
}

// ── Publish checklist ───────────────────────────────────────────────────────

export interface ChecklistItem {
  id: "basics" | "photos" | "rsvp-deadline" | "rsvp-email" | "placeholders" | "approved";
  ok: boolean;
  label: string;
}

// ── Errors ──────────────────────────────────────────────────────────────────

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: string;
  issues?: ValidationIssue[];
}
