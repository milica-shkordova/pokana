import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  leadInputSchema,
  rsvpInputSchema,
  unlockSchema,
  type PublicEventResponse,
  type RsvpInput,
  type TemplateSummary,
} from "@momentelo/shared";
import { getDefinition, resolveSections } from "@momentelo/templates/definitions";
import { db } from "../db";
import { createUnlockToken, verifyPreviewToken, verifyUnlockToken } from "../auth";
import { body, errorBody, notFound } from "../lib/http";
import { leadEmail } from "../lib/emails";
import { sendMail } from "../lib/mailer";
import { rateLimit } from "../lib/rate-limit";
import { getPublicSettings, getSettings } from "../lib/settings";
import { eventSections, isViewable, rsvpOpen, toPublicEvent, toPublicMeta } from "../lib/events";
import { kickEmailQueue } from "../jobs";
import { storage } from "../lib/storage";
import { toTemplateSummaries } from "./admin/templates";

// Unauthenticated endpoints used by the public site.
export const publicRoutes = new Hono();

const formLimiter = rateLimit({ name: "public-forms", windowMs: 10 * 60_000, max: 20 });
const unlockLimiter = rateLimit({ name: "unlock", windowMs: 10 * 60_000, max: 15 });

publicRoutes.get("/settings", async (c) => c.json(await getPublicSettings()));

/** Live + coming-soon templates for the landing page (hidden/draft are left out). */
publicRoutes.get("/templates", async (c) => {
  const all = await toTemplateSummaries();
  return c.json<TemplateSummary[]>(all.filter((t) => t.status === "live" || t.status === "coming-soon"));
});

/** The invitation, or why it can't be shown (locked / ended / not published). */
publicRoutes.get("/events/:slug", async (c) => {
  const e = await db.event.findUnique({ where: { slug: c.req.param("slug") } });
  if (!e || e.isDefaults) notFound("Invitation");
  const meta = toPublicMeta(e);
  if (!isViewable(e)) return c.json<PublicEventResponse>({ state: "unpublished", meta });
  if (e.expiresAt && e.expiresAt < new Date()) return c.json<PublicEventResponse>({ state: "ended", meta });
  if (e.accessCode) return c.json<PublicEventResponse>({ state: "locked", meta });
  return c.json<PublicEventResponse>({ state: "live", event: await toPublicEvent(e) });
});

publicRoutes.post("/events/:slug/unlock", unlockLimiter, async (c) => {
  const { code } = await body(c, unlockSchema);
  const e = await db.event.findUnique({ where: { slug: c.req.param("slug") } });
  if (!e || !isViewable(e)) notFound("Invitation");
  if (!e.accessCode || e.accessCode.toLowerCase() !== code.toLowerCase()) {
    return c.json(errorBody("That code doesn't match"), 403);
  }
  return c.json({ event: await toPublicEvent(e), token: createUnlockToken(e.id) });
});

/** Shareable preview: /<slug>?preview=TOKEN (works for drafts). */
publicRoutes.get("/events/:slug/preview", async (c) => {
  const e = await db.event.findUnique({ where: { slug: c.req.param("slug") } });
  if (!e || !verifyPreviewToken(c.req.query("token"), e.id)) {
    throw new HTTPException(403, { message: "Preview link is invalid or has expired" });
  }
  return c.json(await toPublicEvent(e, { preview: true }));
});

/** Editor live-preview iframe (by id, so slug edits don't break it). */
publicRoutes.get("/preview/:id", async (c) => {
  const id = c.req.param("id");
  if (!verifyPreviewToken(c.req.query("token"), id)) {
    throw new HTTPException(403, { message: "Preview link is invalid or has expired" });
  }
  const e = await db.event.findUnique({ where: { id } });
  if (!e) notFound("Invitation");
  return c.json(await toPublicEvent(e, { preview: true }));
});

function totalGuests(input: RsvpInput): number {
  if (!input.attending) return 0;
  if (input.guests?.length) return input.guests.length;
  if (input.adults !== undefined || input.children !== undefined) return (input.adults ?? 0) + (input.children ?? 0);
  if (input.plusOne !== undefined) return input.plusOne ? 2 : 1;
  return input.guestCount || 1;
}

publicRoutes.post("/events/:slug/rsvp", formLimiter, async (c) => {
  const input = await body(c, rsvpInputSchema);
  const e = await db.event.findUnique({ where: { slug: c.req.param("slug") } });
  if (!e || e.status !== "live") notFound("Invitation");
  if (input.website) return c.json({ ok: true }, 201); // honeypot
  if (e.accessCode && !verifyUnlockToken(c.req.header("x-unlock-token"), e.id)) {
    return c.json(errorBody("This invitation is protected"), 403);
  }
  if (!rsvpOpen(e)) return c.json(errorBody("RSVPs for this invitation are closed"), 409);

  // Gallery demos are public playgrounds: accept, but don't store or email.
  if (e.isDemo) return c.json({ ok: true, demo: true }, 202);

  const def = getDefinition(e.templateId);
  const rsvpOn = !!def && resolveSections(def, eventSections(e)).some((x) => x.id === "rsvp" && x.enabled);
  if (!rsvpOn) return c.json(errorBody("This invitation doesn't take RSVPs"), 409);

  await db.rsvp.create({
    data: {
      eventId: e.id,
      attending: input.attending,
      name: input.name,
      guests: input.attending ? (input.guests ?? []) : [],
      totalGuests: totalGuests(input),
      adults: input.attending ? (input.adults ?? null) : null,
      children: input.attending ? (input.children ?? null) : null,
      allergies: input.allergies ?? null,
      message: input.message ?? null,
      extra: {
        company: input.company,
        email: input.email,
        dinner: input.dinner,
        plusOne: input.plusOne,
      },
      locale: input.locale,
      nextEmailAt: new Date(),
    },
  });
  kickEmailQueue();
  return c.json({ ok: true }, 201);
});

publicRoutes.post("/leads", formLimiter, async (c) => {
  const input = await body(c, leadInputSchema);
  if (input.website) return c.json({ ok: true }, 201); // honeypot

  const lead = await db.lead.create({
    data: {
      source: input.source,
      name: input.name,
      contact: input.contact,
      templateId: input.templateId,
      eventDate: input.eventDate,
      guestCount: input.guestCount,
      message: input.message ?? "",
    },
  });

  const settings = await getSettings();
  const template = lead.templateId
    ? (getDefinition(lead.templateId)?.name ?? (await db.template.findUnique({ where: { id: lead.templateId } }))?.name)
    : null;
  sendMail(leadEmail(settings, { ...lead, template })).catch((err: unknown) =>
    console.error("[leads] notification failed:", (err as Error).message),
  );
  return c.json({ ok: true }, 201);
});

/** Media files (local storage driver, or proxied from S3 when there's no public bucket URL). */
publicRoutes.get("/media/*", async (c) => {
  const key = decodeURIComponent(c.req.path.replace(/^\/api\/public\/media\//, ""));
  if (!key.startsWith("media/")) notFound("File");
  const range = parseRange(c.req.header("range"));
  const obj = await storage.get(key, range);
  if (!obj) notFound("File");
  const ext = key.split(".").pop()?.toLowerCase();
  const type =
    obj.contentType ??
    ({ webp: "image/webp", jpg: "image/jpeg", png: "image/png", heic: "image/heic", mp3: "audio/mpeg" } as Record<string, string>)[ext ?? ""] ??
    "application/octet-stream";
  c.header("Content-Type", type);
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  c.header("Accept-Ranges", "bytes");
  if (obj.range) {
    c.header("Content-Range", `bytes ${obj.range.start}-${obj.range.end}/${obj.range.total}`);
    c.header("Content-Length", String(obj.range.end - obj.range.start + 1));
    return c.body(obj.body, 206);
  }
  if (obj.size) c.header("Content-Length", String(obj.size));
  return c.body(obj.body);
});

/** "bytes=100-" / "bytes=100-200" (single range only — enough for <audio> seeking in Safari). */
function parseRange(header: string | undefined): { start: number; end?: number } | undefined {
  const m = header?.match(/^bytes=(\d+)-(\d*)$/);
  if (!m) return undefined;
  return { start: Number(m[1]), end: m[2] ? Number(m[2]) : undefined };
}
