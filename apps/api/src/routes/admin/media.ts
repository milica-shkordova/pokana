import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { bodyLimit } from "hono/body-limit";
import { mediaUpdateSchema, type MediaLibrary } from "@pokanito/shared";
import { db } from "../../db";
import type { AuthEnv } from "../../auth";
import { env } from "../../env";
import { body, notFound } from "../../lib/http";
import { deleteMediaFiles, ingestFile, replaceFile, toMediaItem } from "../../lib/media";
import { storage } from "../../lib/storage";
import { revalidate } from "../../lib/revalidate";

export const mediaRoutes = new Hono<AuthEnv>();

const include = {
  event: { select: { name: true } },
  usages: { include: { event: { select: { name: true } } } },
} as const;

const uploadLimit = bodyLimit({
  maxSize: 120 * 1024 * 1024,
  onError: (c) => c.json({ error: "Upload too large (max 120 MB per request)" }, 413),
});

mediaRoutes.get("/", async (c) => {
  const eventId = c.req.query("eventId");
  const kind = c.req.query("kind");
  const unused = c.req.query("unused") === "1";
  const rows = await db.media.findMany({
    where: {
      ...(eventId === "shared" ? { eventId: null } : eventId ? { eventId } : {}),
      ...(kind === "photo" || kind === "audio" ? { kind } : {}),
      ...(unused ? { usages: { none: {} } } : {}),
    },
    include,
    orderBy: { uploadedAt: "desc" },
  });
  const total = await db.media.aggregate({ _sum: { bytes: true, optimizedBytes: true } });
  return c.json<MediaLibrary>({
    items: rows.map(toMediaItem),
    storage: {
      // Originals plus (roughly 3×) the 1080 variant for the other web sizes.
      usedBytes: (total._sum.bytes ?? 0) + (total._sum.optimizedBytes ?? 0) * 3,
      quotaBytes: env.MEDIA_QUOTA_GB * 1024 ** 3,
    },
  });
});

/** Multipart upload: one or more `file` fields, optional `eventId`. */
mediaRoutes.post("/", uploadLimit, async (c) => {
  const form = await c.req.parseBody({ all: true });
  const files = ([] as unknown[]).concat(form.file ?? []).filter((f): f is File => f instanceof File);
  if (!files.length) throw new HTTPException(400, { message: "No files" });
  const eventId = typeof form.eventId === "string" && form.eventId ? form.eventId : null;
  if (eventId && !(await db.event.findUnique({ where: { id: eventId }, select: { id: true } }))) notFound("Event");

  const created = [];
  for (const file of files) created.push(await ingestFile(file, eventId));
  const rows = await db.media.findMany({ where: { id: { in: created.map((m) => m.id) } }, include });
  return c.json(rows.map(toMediaItem), 201);
});

mediaRoutes.patch("/:id", async (c) => {
  const input = await body(c, mediaUpdateSchema);
  const row = await db.media
    .update({ where: { id: c.req.param("id") }, data: input, include })
    .catch(() => notFound("File"));
  // Focal point / alt text show on live pages.
  const slugs = await db.event.findMany({ where: { id: { in: row.usages.map((u) => u.eventId) }, status: { in: ["live", "past"] } }, select: { slug: true } });
  if (slugs.length) revalidate(...slugs.map((s) => `/${s.slug}`));
  return c.json(toMediaItem(row));
});

mediaRoutes.post("/:id/replace", uploadLimit, async (c) => {
  const media = await db.media.findUnique({ where: { id: c.req.param("id") } });
  if (!media) notFound("File");
  const form = await c.req.parseBody();
  if (!(form.file instanceof File)) throw new HTTPException(400, { message: "No file" });
  await replaceFile(media, form.file);
  const row = await db.media.findUniqueOrThrow({ where: { id: media.id }, include });
  const slugs = await db.event.findMany({ where: { id: { in: row.usages.map((u) => u.eventId) }, status: { in: ["live", "past"] } }, select: { slug: true } });
  if (slugs.length) revalidate(...slugs.map((s) => `/${s.slug}`));
  return c.json(toMediaItem(row));
});

mediaRoutes.get("/:id/original", async (c) => {
  const media = await db.media.findUnique({ where: { id: c.req.param("id") } });
  if (!media) notFound("File");
  const obj = await storage.get(media.originalKey);
  if (!obj) notFound("File");
  c.header("Content-Type", media.mime);
  c.header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(media.fileName)}`);
  return c.body(obj.body);
});

/** Refuses to delete a file that's in use unless ?force=1. */
mediaRoutes.delete("/:id", async (c) => {
  const media = await db.media.findUnique({ where: { id: c.req.param("id") }, include });
  if (!media) notFound("File");
  if (media.usages.length && c.req.query("force") !== "1") {
    const where = [...new Set(media.usages.map((u) => u.event.name))].join(", ");
    throw new HTTPException(409, { message: `In use in ${where}` });
  }
  await db.media.delete({ where: { id: media.id } });
  await deleteMediaFiles(media).catch(() => undefined);
  return c.body(null, 204);
});
