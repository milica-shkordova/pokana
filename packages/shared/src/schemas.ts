import { z } from "zod";
import {
  EVENT_STATUSES,
  LEAD_SOURCES,
  LEAD_STAGES,
  LOCALES,
  RESERVED_SLUGS,
  TEMPLATE_CATEGORIES,
  TEMPLATE_STATUSES,
  USER_ROLES,
} from "./constants";
import { eventContentSchema, sectionStateSchema, themeSchema } from "./content";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #B5502F");

// Request payload schemas. The API validates every body with these, and the
// front-ends reuse them for client-side validation and typing.

export const slugSchema = z
  .string()
  .trim()
  .min(2, "At least 2 characters")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single dashes (e.g. ana-marko)")
  .refine((s) => !(RESERVED_SLUGS as readonly string[]).includes(s), { message: "This link is reserved by the site" });

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));

const isoDateTime = z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");
const emailList = z.array(z.string().trim().toLowerCase().email("Invalid email")).max(10);
const honeypot = z.string().max(0).optional();

// ── Public ────────────────────────────────────────────────────────────────

export const rsvpGuestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  menu: optionalText(100),
});

export const rsvpInputSchema = z.object({
  attending: z.boolean(),
  name: z.string().trim().min(1, "Please enter your name").max(200),
  /** guests-with-menu: one entry per guest (the first is usually the sender). */
  guests: z.array(rsvpGuestSchema).max(30).optional(),
  /** guest-count mode. */
  guestCount: z.number().int().min(0).max(50).optional(),
  /** kids mode. */
  adults: z.number().int().min(0).max(50).optional(),
  children: z.number().int().min(0).max(50).optional(),
  /** plus-one mode. */
  plusOne: z.boolean().optional(),
  /** registration mode. */
  company: optionalText(200),
  email: z.string().trim().email().max(200).optional().or(z.literal("").transform(() => undefined)),
  dinner: z.boolean().optional(),
  allergies: optionalText(500),
  message: optionalText(2000),
  locale: z.enum(LOCALES).optional(),
  website: honeypot,
});
export type RsvpInput = z.infer<typeof rsvpInputSchema>;

export const leadInputSchema = z.object({
  source: z.enum(LEAD_SOURCES).default("contact-form"),
  name: z.string().trim().min(1, "Please enter your name").max(200),
  contact: z.string().trim().min(3, "Please add an email or phone").max(200),
  templateId: optionalText(80),
  eventDate: optionalText(40),
  guestCount: z.number().int().min(0).max(5000).optional(),
  message: optionalText(5000),
  website: honeypot,
});
export type LeadInput = z.input<typeof leadInputSchema>;

export const unlockSchema = z.object({ code: z.string().trim().min(1).max(40) });

// ── Auth & team ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(10, "Use at least 10 characters").max(200),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: optionalText(120),
  role: z.enum(USER_ROLES).default("editor"),
});

export const userUpdateSchema = z.object({ role: z.enum(USER_ROLES).optional(), name: optionalText(120) });

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10, "Use at least 10 characters").max(200),
});

// ── Events ────────────────────────────────────────────────────────────────

export const eventCreateSchema = z.object({
  templateId: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(160),
  slug: slugSchema.optional(),
  eventDate: isoDateTime.optional(),
  clientName: optionalText(160),
  clientContact: optionalText(200),
  leadId: z.string().optional(),
});
export type EventCreateInput = z.infer<typeof eventCreateSchema>;

/** Autosave payload — any subset. Content is validated structurally; completeness is checked at publish. */
export const eventUpdateSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  slug: slugSchema.optional(),
  clientName: z.string().trim().max(160).optional(),
  clientContact: z.string().trim().max(200).optional(),
  eventDate: isoDateTime.optional(),
  languages: z.array(z.enum(LOCALES)).min(1).max(2).optional(),
  content: eventContentSchema.optional(),
  theme: themeSchema.optional(),
  sections: z.array(sectionStateSchema).optional(),
  rsvpEmails: emailList.optional(),
  rsvpDeadline: isoDateTime.nullable().optional(),
  expectedGuests: z.number().int().min(0).max(5000).nullable().optional(),
  accessCode: z.string().trim().max(40).nullable().optional(),
  noindex: z.boolean().optional(),
  clientApproved: z.boolean().optional(),
  status: z.enum(EVENT_STATUSES).optional(),
});
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

// ── Templates (catalog) ───────────────────────────────────────────────────

export const templateUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(600).optional(),
  status: z.enum(TEMPLATE_STATUSES).optional(),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  thumbLabel: z.string().trim().max(24).nullable().optional(),
  thumbBg: hexColor.nullable().optional(),
  thumbInk: hexColor.nullable().optional(),
  demoEventId: z.string().nullable().optional(),
  previewMediaId: z.string().nullable().optional(),
});

/** New template = a variant of an existing template's layout. */
export const templateCreateSchema = z.object({
  baseId: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
});
export type TemplateCreateInput = z.infer<typeof templateCreateSchema>;
export type TemplateUpdateInput = z.infer<typeof templateUpdateSchema>;

// ── Leads ─────────────────────────────────────────────────────────────────

export const leadUpdateSchema = z.object({
  stage: z.enum(LEAD_STAGES).optional(),
  note: z.string().max(5000).nullable().optional(),
  unread: z.boolean().optional(),
});
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

// ── Media ─────────────────────────────────────────────────────────────────

export const mediaUpdateSchema = z.object({
  alt: z.string().max(300).optional(),
  focalX: z.number().min(0).max(1).optional(),
  focalY: z.number().min(0).max(1).optional(),
  eventId: z.string().nullable().optional(),
});
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;

// ── Settings ──────────────────────────────────────────────────────────────

export const settingsSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  contactEmail: z.string().trim().email(),
  phone: z.string().trim().max(60).default(""),
  instagram: z.string().trim().max(80).default(""),
  logoMediaId: z.string().nullable().default(null),
  senderName: z.string().trim().min(1).max(120),
  fromAddress: z.string().trim().email(),
  subjectTemplate: z.string().trim().min(1).max(200),
  ccOwnerOnRsvp: z.boolean(),
  clientDailyDigest: z.boolean(),
  domain: z.string().trim().min(1).max(120),
  /** 0 = forever. */
  keepOnlineMonths: z.number().int().min(0).max(120),
  defaultNoindex: z.boolean(),
  defaultPassword: z.boolean(),
  defaultLanguage: z.enum(["mk", "en", "both"]),
  defaultRsvpDeadlineDays: z.number().int().min(0).max(365),
  defaultMenuOptions: z.array(z.string().trim().min(1).max(80)).max(12),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
