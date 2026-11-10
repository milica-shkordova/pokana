import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Prisma } from "@prisma/client";
import {
  EVENT_STATUSES,
  eventCreateSchema,
  eventUpdateSchema,
  slugSchema,
  type EventDetail,
  type EventStats,
  type Locale,
  type Rsvp,
  type RsvpGuest,
} from "@momentelo/shared";
import { getDefinition } from "@momentelo/templates/definitions";
import { db } from "../../db";
import { createPreviewToken, type AuthEnv } from "../../auth";
import { env } from "../../env";
import { body, notFound } from "../../lib/http";
import { revalidate } from "../../lib/revalidate";
import { getSettings } from "../../lib/settings";
import { startingPoint } from "../../lib/templates";
import { sendMail, MailError } from "../../lib/mailer";
import { rsvpEmail, sampleRsvp } from "../../lib/emails";
import {
  assertPublishable,
  computeExpiresAt,
  eventContent,
  eventEmails,
  eventLanguages,
  isPastDate,
  newEventData,
  syncMediaUsage,
  toEventDetail,
  toEventSummary,
  uniqueSlug,
  withListExtras,
} from "../../lib/events";
import { kickEmailQueue } from "../../jobs";

export const eventRoutes = new Hono<AuthEnv>();

const withCount = { _count: { select: { rsvps: true } } } as const;

async function loadDetail(id: string): Promise<EventDetail> {
  const row = await db.event.findUnique({ where: { id }, include: withCount });
  if (!row) notFound("Event");
  const [extended] = await withListExtras([row]);
  return toEventDetail(extended);
}

/** Paths whose static pages depend on this event. */
async function revalidateEvent(slugs: string[], eventId: string) {
  const demoOf = await db.template.count({ where: { demoEventId: eventId } });
  revalidate(...slugs.map((s) => `/${s}`), ...(demoOf ? ["/"] : []));
}

// ── List & stats ────────────────────────────────────────────────────────────

eventRoutes.get("/stats", async (c) => {
  const weekAhead = new Date(Date.now() + 7 * 86_400_000);
  const [live, liveThisWeek, draftsAndReview, rsvps, newLeads] = await Promise.all([
    db.event.count({ where: { status: "live", isDemo: false, isDefaults: false } }),
    db.event.count({ where: { status: "live", isDemo: false, isDefaults: false, eventDate: { gte: new Date(), lte: weekAhead } } }),
    db.event.count({ where: { status: { in: ["draft", "in-review"] }, isDemo: false, isDefaults: false } }),
    db.rsvp.count({ where: { event: { status: "live" } } }),
    db.lead.count({ where: { unread: true, stage: { not: "lost" } } }),
  ]);
  return c.json<EventStats>({ live, liveThisWeek, draftsAndReview, rsvps, newLeads });
});

eventRoutes.get("/", async (c) => {
  const q = c.req.query("q")?.trim().toLowerCase();
  const status = c.req.query("status");
  const category = c.req.query("category");
  const sort = c.req.query("sort") ?? "eventDate";
  const includeDemo = c.req.query("demo") === "1";
  // ?archived=include: archived events too (the list then filters by tab itself).
  const withArchived = c.req.query("archived") === "include";

  const rows = await db.event.findMany({
    where: {
      ...(status && (EVENT_STATUSES as readonly string[]).includes(status)
        ? { status }
        : withArchived
          ? {}
          : { status: { not: "archived" } }),
      ...(includeDemo ? {} : { isDemo: false }),
      isDefaults: false,
    },
    include: withCount,
    orderBy:
      sort === "updated" ? { updatedAt: "desc" } : sort === "name" ? { name: "asc" } : { eventDate: "asc" },
  });

  const variantCategory = new Map(
    (await db.template.findMany({ where: { layoutId: { not: null } }, select: { id: true, category: true } })).map((t) => [t.id, t.category]),
  );
  // Search & category run in JS: names are mostly Cyrillic and SQLite's LIKE is ASCII-only case-insensitive.
  const filtered = rows.filter((r) => {
    if (category && (variantCategory.get(r.variantId ?? "") ?? getDefinition(r.templateId)?.category) !== category) return false;
    if (!q) return true;
    return [r.name, r.clientName, r.slug].some((v) => v.toLowerCase().includes(q));
  });
  return c.json((await withListExtras(filtered)).map(toEventSummary));
});

eventRoutes.get("/slug-available", async (c) => {
  const parsed = slugSchema.safeParse(c.req.query("slug") ?? "");
  if (!parsed.success) return c.json({ available: false, reason: parsed.error.issues[0]?.message });
  const taken = await db.event.findUnique({ where: { slug: parsed.data }, select: { id: true } });
  const available = !taken || taken.id === c.req.query("exceptId");
  return c.json({ available, reason: available ? undefined : "Already used by another event" });
});

// ── CRUD ────────────────────────────────────────────────────────────────────

eventRoutes.post("/", async (c) => {
  const input = await body(c, eventCreateSchema);
  // input.templateId is a catalog template (a layout or a variant of one);
  // the event starts as a copy of that template's defaults.
  const start = await startingPoint(input.templateId);
  const settings = await getSettings();
  const eventDate = input.eventDate ? new Date(input.eventDate) : new Date(Date.now() + 90 * 86_400_000);
  const slug = input.slug ?? (await uniqueSlug(input.name));
  if (input.slug && (await db.event.findUnique({ where: { slug } }))) {
    throw new HTTPException(409, { message: `The link "${slug}" is already taken` });
  }
  const lead = input.leadId ? await db.lead.findUnique({ where: { id: input.leadId } }) : null;

  const created = await db.event.create({
    data: {
      ...newEventData(start.def, settings, eventDate),
      ...start.copy,
      templateId: start.layoutId,
      variantId: start.variantId,
      slug,
      name: input.name,
      eventDate,
      clientName: input.clientName ?? lead?.name ?? "",
      clientContact: input.clientContact ?? lead?.contact ?? "",
      rsvpEmails: lead?.contact.includes("@") ? [lead.contact.toLowerCase()] : [],
      leadId: lead && !(await db.event.findUnique({ where: { leadId: lead.id } })) ? lead.id : null,
      createdById: c.get("user").id,
    },
  });
  if (lead && ["new", "contacted", "preview-sent"].includes(lead.stage)) {
    await db.lead.update({ where: { id: lead.id }, data: { stage: "won", unread: false } });
  }
  return c.json(await loadDetail(created.id), 201);
});

eventRoutes.get("/:id", async (c) => c.json(await loadDetail(c.req.param("id"))));

/** Autosave. Any subset of fields; completeness is only enforced on publish. */
eventRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const input = await body(c, eventUpdateSchema);
  const current = await db.event.findUnique({ where: { id } });
  if (!current) notFound("Event");

  if (input.slug && input.slug !== current.slug) {
    const taken = await db.event.findUnique({ where: { slug: input.slug }, select: { id: true } });
    if (taken) throw new HTTPException(409, { message: `The link "${input.slug}" is already taken` });
  }
  if (input.status === "live") throw new HTTPException(400, { message: "Use Publish to go live" });

  const emails = input.rsvpEmails;
  const emailsChanged = emails && JSON.stringify(emails) !== JSON.stringify(eventEmails(current));
  const eventDate = input.eventDate ? new Date(input.eventDate) : undefined;
  const settings = eventDate ? await getSettings() : null;

  const data: Prisma.EventUpdateInput = {
    name: input.name,
    slug: input.slug,
    clientName: input.clientName,
    clientContact: input.clientContact,
    eventDate,
    languages: input.languages,
    content: input.content as Prisma.InputJsonValue | undefined,
    theme: input.theme,
    sections: input.sections as Prisma.InputJsonValue | undefined,
    rsvpEmails: emails,
    rsvpDeadline: input.rsvpDeadline === undefined ? undefined : input.rsvpDeadline ? new Date(input.rsvpDeadline) : null,
    expectedGuests: input.expectedGuests,
    accessCode: input.accessCode === undefined ? undefined : input.accessCode || null,
    noindex: input.noindex,
    clientApproved: input.clientApproved,
    status: input.status,
    // Changing who receives RSVPs means they need a fresh test.
    rsvpTestedAt: emailsChanged ? null : undefined,
    expiresAt: eventDate && settings && current.publishedAt ? computeExpiresAt(eventDate, settings.keepOnlineMonths) : undefined,
  };
  await db.event.update({ where: { id }, data });
  if (input.content) await syncMediaUsage(id, input.content);

  if (current.status === "live" || current.status === "past") {
    await revalidateEvent([current.slug, input.slug ?? current.slug], id);
  }
  return c.json(await loadDetail(id));
});

eventRoutes.post("/:id/publish", async (c) => {
  const id = c.req.param("id");
  const e = await db.event.findUnique({ where: { id } });
  if (!e) notFound("Event");
  if (e.isDefaults) throw new HTTPException(400, { message: "Template defaults can't be published" });
  if (!e.isDemo) assertPublishable(e);
  const settings = await getSettings();
  await db.event.update({
    where: { id },
    data: {
      status: isPastDate(e.eventDate) ? "past" : "live",
      publishedAt: e.publishedAt ?? new Date(),
      expiresAt: computeExpiresAt(e.eventDate, settings.keepOnlineMonths),
    },
  });
  if (e.leadId) await db.lead.update({ where: { id: e.leadId }, data: { stage: "live" } }).catch(() => undefined);
  await revalidateEvent([e.slug], id);
  return c.json(await loadDetail(id));
});

eventRoutes.post("/:id/unpublish", async (c) => {
  const id = c.req.param("id");
  const e = await db.event.findUnique({ where: { id } });
  if (!e) notFound("Event");
  await db.event.update({ where: { id }, data: { status: "draft" } });
  await revalidateEvent([e.slug], id);
  return c.json(await loadDetail(id));
});

/**
 * Moves an event out of the active lists. `{ keepOnline: true }` keeps the
 * invitation link working (read-only, no new RSVPs), e.g. to look back at the
 * photos. The previous status is remembered for Restore.
 */
eventRoutes.post("/:id/archive", async (c) => {
  const id = c.req.param("id");
  const e = await db.event.findUnique({ where: { id } });
  if (!e) notFound("Event");
  if (e.isDefaults) throw new HTTPException(400, { message: "Template defaults can't be archived" });
  const input = (await c.req.json().catch(() => ({}))) as { keepOnline?: unknown };
  await db.event.update({
    where: { id },
    data: {
      status: "archived",
      archivedOnline: input.keepOnline === true,
      statusBeforeArchive: e.status === "archived" ? e.statusBeforeArchive : e.status,
    },
  });
  await revalidateEvent([e.slug], id);
  return c.json(await loadDetail(id));
});

/** Back from Archived to where it was (a published one is re-checked against its date). */
eventRoutes.post("/:id/restore", async (c) => {
  const id = c.req.param("id");
  const e = await db.event.findUnique({ where: { id } });
  if (!e) notFound("Event");
  if (e.status !== "archived") throw new HTTPException(400, { message: "Only archived events can be restored" });
  const before = e.statusBeforeArchive;
  const status =
    before === "live" || before === "past"
      ? isPastDate(e.eventDate)
        ? "past"
        : "live"
      : before === "in-review"
        ? "in-review"
        : "draft";
  await db.event.update({ where: { id }, data: { status, archivedOnline: false, statusBeforeArchive: null } });
  await revalidateEvent([e.slug], id);
  return c.json(await loadDetail(id));
});

eventRoutes.post("/:id/duplicate", async (c) => {
  const e = await db.event.findUnique({ where: { id: c.req.param("id") } });
  if (!e) notFound("Event");
  const copy = await db.event.create({
    data: {
      slug: await uniqueSlug(`${e.slug}-copy`),
      templateId: e.templateId,
      variantId: e.variantId,
      name: `${e.name} (copy)`,
      clientName: e.clientName,
      clientContact: e.clientContact,
      eventDate: e.eventDate,
      languages: e.languages as Prisma.InputJsonValue,
      content: e.content as Prisma.InputJsonValue,
      theme: e.theme as Prisma.InputJsonValue,
      sections: e.sections as Prisma.InputJsonValue,
      rsvpEmails: e.rsvpEmails as Prisma.InputJsonValue,
      rsvpDeadline: e.rsvpDeadline,
      expectedGuests: e.expectedGuests,
      accessCode: e.accessCode,
      noindex: e.noindex,
      createdById: c.get("user").id,
    },
  });
  await syncMediaUsage(copy.id, eventContent(copy));
  return c.json(await loadDetail(copy.id), 201);
});

eventRoutes.delete("/:id", async (c) => {
  const e = await db.event.findUnique({ where: { id: c.req.param("id") } });
  if (!e) notFound("Event");
  if (e.isDefaults) throw new HTTPException(400, { message: "These are a template's defaults — delete the template instead" });
  await db.event.delete({ where: { id: e.id } });
  revalidate(`/${e.slug}`);
  return c.body(null, 204);
});

// ── Preview & email ─────────────────────────────────────────────────────────

/** Shareable preview link for the client. Optionally moves a draft to "in review". */
eventRoutes.post("/:id/preview-link", async (c) => {
  const id = c.req.param("id");
  const e = await db.event.findUnique({ where: { id } });
  if (!e) notFound("Event");
  const markInReview = c.req.query("review") === "1";
  if (markInReview && e.status === "draft") {
    await db.event.update({ where: { id }, data: { status: "in-review" } });
    if (e.leadId) await db.lead.updateMany({ where: { id: e.leadId, stage: { in: ["new", "contacted"] } }, data: { stage: "preview-sent" } });
  }
  const token = createPreviewToken(id);
  return c.json({
    url: `${env.WEB_URL}/${e.slug}?preview=${encodeURIComponent(token)}`,
    embedUrl: `${env.WEB_URL}/preview/${id}?token=${encodeURIComponent(token)}&embed=1`,
  });
});

/** Sends a sample RSVP to the event's RSVP addresses and marks them as tested. */
eventRoutes.post("/:id/test-email", async (c) => {
  const id = c.req.param("id");
  const e = await db.event.findUnique({ where: { id } });
  if (!e) notFound("Event");
  const to = eventEmails(e);
  if (!to.length) throw new HTTPException(400, { message: "Add at least one RSVP email first" });
  const settings = await getSettings();
  const locale: Locale = eventLanguages(e)[0] ?? "mk";
  const menus = eventContent(e).rsvp?.menuOptions ?? settings.defaultMenuOptions;
  try {
    const sent = await sendMail(rsvpEmail(settings, to, [], sampleRsvp(e.name, locale, menus), true));
    await db.event.update({ where: { id }, data: { rsvpTestedAt: new Date() } });
    return c.json({ ok: true, to, dev: !!sent.dev });
  } catch (err) {
    throw new HTTPException(502, { message: `Couldn't send: ${err instanceof MailError ? err.message : "email provider error"}` });
  }
});

// ── RSVPs ───────────────────────────────────────────────────────────────────

const toRsvp = (r: Awaited<ReturnType<typeof db.rsvp.findFirstOrThrow>>): Rsvp => ({
  id: r.id,
  eventId: r.eventId,
  attending: r.attending,
  name: r.name,
  guests: (r.guests as RsvpGuest[] | null) ?? [],
  totalGuests: r.totalGuests,
  adults: r.adults,
  children: r.children,
  allergies: r.allergies,
  message: r.message,
  extra: (r.extra as Rsvp["extra"] | null) ?? {},
  createdAt: r.createdAt.toISOString(),
  emailedAt: r.emailedAt?.toISOString() ?? null,
  emailError: r.emailError,
});

eventRoutes.get("/:id/rsvps", async (c) => {
  const rows = await db.rsvp.findMany({ where: { eventId: c.req.param("id") }, orderBy: { createdAt: "desc" } });
  return c.json(rows.map(toRsvp));
});

eventRoutes.get("/:id/rsvps.csv", async (c) => {
  const e = await db.event.findUnique({ where: { id: c.req.param("id") } });
  if (!e) notFound("Event");
  const rows = (await db.rsvp.findMany({ where: { eventId: e.id }, orderBy: { createdAt: "asc" } })).map(toRsvp);
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    ["Submitted", "Name", "Attending", "Guests", "Guest names / menu", "Adults", "Children", "Allergies", "Company", "Email", "Dinner", "Message", "Emailed"]
      .map(cell)
      .join(","),
    ...rows.map((r) =>
      [
        r.createdAt,
        r.name,
        r.attending ? "yes" : "no",
        r.totalGuests,
        r.guests.map((g) => (g.menu ? `${g.name} (${g.menu})` : g.name)).join("; "),
        r.adults,
        r.children,
        r.allergies,
        r.extra.company,
        r.extra.email,
        r.extra.dinner === undefined ? "" : r.extra.dinner ? "yes" : "no",
        r.message,
        r.emailedAt ?? r.emailError ?? "pending",
      ]
        .map(cell)
        .join(","),
    ),
  ];
  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", `attachment; filename="rsvps-${e.slug}.csv"`);
  return c.body("﻿" + lines.join("\r\n")); // BOM so Excel reads Cyrillic correctly
});

export const rsvpRoutes = new Hono<AuthEnv>();

rsvpRoutes.delete("/:id", async (c) => {
  await db.rsvp.delete({ where: { id: c.req.param("id") } }).catch(() => notFound("RSVP"));
  return c.body(null, 204);
});

/** Retry a failed RSVP email now. */
rsvpRoutes.post("/:id/resend", async (c) => {
  await db.rsvp
    .update({ where: { id: c.req.param("id") }, data: { emailedAt: null, emailAttempts: 0, nextEmailAt: new Date(), emailError: null } })
    .catch(() => notFound("RSVP"));
  kickEmailQueue();
  return c.json({ ok: true });
});
