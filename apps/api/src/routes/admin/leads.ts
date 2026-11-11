import { Hono } from "hono";
import { LEAD_STAGES, leadUpdateSchema, type Lead, type LeadSource, type LeadStage } from "@momentelo/shared";
import { getDefinition } from "@momentelo/templates/definitions";
import type { Lead as DbLead } from "@prisma/client";
import { db } from "../../db";
import type { AuthEnv } from "../../auth";
import { body, notFound } from "../../lib/http";

export const leadRoutes = new Hono<AuthEnv>();

async function serialize(rows: (DbLead & { event?: { id: string } | null })[]): Promise<Lead[]> {
  const templateIds = [...new Set(rows.map((r) => r.templateId).filter(Boolean))] as string[];
  const templates = templateIds.length ? await db.template.findMany({ where: { id: { in: templateIds } } }) : [];
  return rows.map((r) => ({
    id: r.id,
    source: r.source as LeadSource,
    name: r.name,
    contact: r.contact,
    templateId: r.templateId,
    templateName: r.templateId
      ? (templates.find((t) => t.id === r.templateId)?.name ?? getDefinition(r.templateId)?.name ?? r.templateId)
      : null,
    eventDate: r.eventDate,
    guestCount: r.guestCount,
    message: r.message,
    stage: r.stage as LeadStage,
    unread: r.unread,
    note: r.note,
    eventId: r.event?.id ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

leadRoutes.get("/", async (c) => {
  const stage = c.req.query("stage");
  const rows = await db.lead.findMany({
    where: stage && (LEAD_STAGES as readonly string[]).includes(stage) ? { stage } : {},
    include: { event: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  return c.json(await serialize(rows));
});

leadRoutes.get("/export.csv", async (c) => {
  const leads = await serialize(await db.lead.findMany({ include: { event: { select: { id: true } } }, orderBy: { createdAt: "desc" } }));
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    ["Received", "Source", "Name", "Contact", "Template", "Event date", "Guests", "Stage", "Message", "Note"].map(cell).join(","),
    ...leads.map((l) =>
      [l.createdAt, l.source, l.name, l.contact, l.templateName, l.eventDate, l.guestCount, l.stage, l.message, l.note].map(cell).join(","),
    ),
  ];
  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", `attachment; filename="momentelo-leads.csv"`);
  return c.body("﻿" + lines.join("\r\n"));
});

leadRoutes.patch("/:id", async (c) => {
  const input = await body(c, leadUpdateSchema);
  const row = await db.lead
    .update({ where: { id: c.req.param("id") }, data: input, include: { event: { select: { id: true } } } })
    .catch(() => notFound("Lead"));
  return c.json((await serialize([row]))[0]);
});

leadRoutes.delete("/:id", async (c) => {
  await db.lead.delete({ where: { id: c.req.param("id") } }).catch(() => notFound("Lead"));
  return c.body(null, 204);
});
