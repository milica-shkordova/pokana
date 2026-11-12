import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import {
  templateCreateSchema,
  templateUpdateSchema,
  type TemplateCategory,
  type TemplateStatus,
  type TemplateSummary,
} from "@pokanito/shared";
import { getDefinition } from "@pokanito/templates/definitions";
import { db } from "../../db";
import type { AuthEnv } from "../../auth";
import { body, notFound } from "../../lib/http";
import { revalidate } from "../../lib/revalidate";
import { eventContent, syncMediaUsage, uniqueSlug } from "../../lib/events";
import { thumbUrl } from "../../lib/media";
import { ensureDefaultsEvent, layoutOf, resolveTemplate } from "../../lib/templates";

const firstWord = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** Catalog rows + usage counts + preview thumbnails. */
export async function toTemplateSummaries(): Promise<TemplateSummary[]> {
  const [rows, usage] = await Promise.all([
    db.template.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], include: { demoEvent: true } }),
    db.event.groupBy({ by: ["templateId", "variantId"], where: { isDemo: false, isDefaults: false }, _count: { _all: true } }),
  ]);
  const previewIds = rows
    .map((r) => r.previewMediaId ?? (r.demoEvent ? eventContent(r.demoEvent).photos?.hero : null))
    .filter(Boolean) as string[];
  const media = previewIds.length ? await db.media.findMany({ where: { id: { in: previewIds } } }) : [];

  return rows.map((r) => {
    const previewId = r.previewMediaId ?? (r.demoEvent ? eventContent(r.demoEvent).photos?.hero : null);
    const m = media.find((x) => x.id === previewId);
    const isVariant = !!r.layoutId;
    // Layout templates count events made straight from the layout; variants count their own.
    const usageCount = usage
      .filter((u) => (isVariant ? u.variantId === r.id : u.templateId === r.id && !u.variantId))
      .reduce((n, u) => n + u._count._all, 0);
    return {
      id: r.id,
      name: r.name,
      category: r.category as TemplateCategory,
      status: r.status as TemplateStatus,
      description: r.description,
      sortOrder: r.sortOrder,
      demoEventId: r.demoEventId,
      demoSlug: r.demoEvent && (r.demoEvent.status === "live" || r.demoEvent.status === "past") ? r.demoEvent.slug : null,
      previewUrl: m ? thumbUrl(m) : null,
      implemented: !!getDefinition(layoutOf(r)),
      usageCount,
      layoutId: layoutOf(r),
      isVariant,
      thumb: { label: r.thumbLabel || firstWord(r.name), bg: r.thumbBg, ink: r.thumbInk },
      defaultsEventId: r.defaultsEventId,
    };
  });
}

const summaryOf = async (id: string) => {
  const found = (await toTemplateSummaries()).find((t) => t.id === id);
  if (!found) notFound("Template");
  return found;
};

export const templateRoutes = new Hono<AuthEnv>();

templateRoutes.get("/", async (c) => c.json(await toTemplateSummaries()));

templateRoutes.patch("/:id", async (c) => {
  const input = await body(c, templateUpdateSchema);
  const id = c.req.param("id");
  const row = await db.template.findUnique({ where: { id } });
  if (!row) notFound("Template");
  // A layout's category comes from its code; only variants can change it.
  if (input.category && !row.layoutId && input.category !== row.category) {
    throw new HTTPException(400, { message: "A built-in template's category is fixed. Create a variant to use it elsewhere." });
  }
  await db.template.update({ where: { id }, data: input });
  if (input.name && row.defaultsEventId) {
    await db.event.update({ where: { id: row.defaultsEventId }, data: { name: input.name } }).catch(() => undefined);
  }
  revalidate("/");
  return c.json(await summaryOf(id));
});

/** Opens (creating on first use) the hidden event holding the template's defaults. */
templateRoutes.post("/:id/defaults", async (c) => {
  const e = await ensureDefaultsEvent(c.req.param("id"));
  return c.json({ eventId: e.id });
});

/** New template = a variant of an existing template's layout, starting from its defaults and demo. */
templateRoutes.post("/", async (c) => {
  const input = await body(c, templateCreateSchema);
  const { template: base } = await resolveTemplate(input.baseId);
  const baseDefaults = await ensureDefaultsEvent(base.id);

  const idBase = (await uniqueSlug(input.name)).replace(/-\d+$/, "");
  let id = idBase;
  for (let i = 2; await db.template.findUnique({ where: { id } }); i++) id = `${idBase}-${i}`;
  const last = await db.template.findFirst({ orderBy: { sortOrder: "desc" } });

  const copyEvent = async (src: NonNullable<typeof baseDefaults>, extra: Partial<Prisma.EventUncheckedCreateInput>) => {
    const e = await db.event.create({
      data: {
        slug: await uniqueSlug(extra.slug ?? `${src.slug}-copy`),
        templateId: src.templateId,
        variantId: id,
        name: input.name,
        eventDate: src.eventDate,
        languages: src.languages as Prisma.InputJsonValue,
        content: src.content as Prisma.InputJsonValue,
        theme: src.theme as Prisma.InputJsonValue,
        sections: src.sections as Prisma.InputJsonValue,
        rsvpEmails: [],
        rsvpDeadline: src.rsvpDeadline,
        noindex: true,
        ...extra,
      },
    });
    await syncMediaUsage(e.id, eventContent(e));
    return e;
  };

  const defaults = await copyEvent(baseDefaults, { slug: `defaults-${id}`, isDefaults: true });
  // The demo starts as a copy of the base demo (real photos), so "Open demo" works straight away.
  const baseDemo = base.demoEventId ? await db.event.findUnique({ where: { id: base.demoEventId } }) : null;
  const demo = baseDemo ? await copyEvent(baseDemo, { slug: `demo-${id}`, isDemo: true, status: "live", publishedAt: new Date(), name: baseDemo.name }) : null;

  await db.template.create({
    data: {
      id,
      name: input.name,
      category: input.category ?? base.category,
      status: "draft",
      description: base.description,
      layoutId: layoutOf(base),
      defaultsEventId: defaults.id,
      demoEventId: demo?.id ?? null,
      thumbBg: base.thumbBg,
      thumbInk: base.thumbInk,
      sortOrder: (last?.sortOrder ?? 0) + 10,
    },
  });
  return c.json(await summaryOf(id), 201);
});

/** Variants can be deleted while no events use them; built-in layouts can only be hidden. */
templateRoutes.delete("/:id", async (c) => {
  const row = await db.template.findUnique({ where: { id: c.req.param("id") } });
  if (!row) notFound("Template");
  if (!row.layoutId) throw new HTTPException(400, { message: "Built-in templates can't be deleted. Set them to Hidden instead." });
  const used = await db.event.count({ where: { variantId: row.id, isDemo: false, isDefaults: false } });
  if (used) throw new HTTPException(409, { message: `${used} event${used === 1 ? " uses" : "s use"} this template` });
  await db.template.delete({ where: { id: row.id } });
  await db.event.deleteMany({ where: { id: { in: [row.defaultsEventId, row.demoEventId].filter(Boolean) as string[] } } });
  revalidate("/");
  return c.body(null, 204);
});

templateRoutes.put("/order", async (c) => {
  const { ids } = await body(c, z.object({ ids: z.array(z.string()).min(1) }));
  await db.$transaction(ids.map((id, i) => db.template.update({ where: { id }, data: { sortOrder: (i + 1) * 10 } })));
  revalidate("/");
  return c.body(null, 204);
});
