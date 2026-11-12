import path from "node:path";
import sharp from "sharp";
import heicConvert from "heic-convert";
import { parseBuffer } from "music-metadata";
import type { Media } from "@prisma/client";
import { PHOTO_WIDTHS, type MediaItem, type MediaKind, type ResolvedMedia } from "@pokanito/shared";
import { db } from "../db";
import { publicUrl, storage } from "./storage";
import { ValidationError } from "./http";

export const MAX_PHOTO_BYTES = 30 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heic",
};
const AUDIO_TYPES: Record<string, string> = { "audio/mpeg": "mp3", "audio/mp3": "mp3" };

/** Browsers often send HEIC as application/octet-stream — fall back to the extension. */
function detectType(file: File): { kind: MediaKind; mime: string; ext: string } {
  const ext = path.extname(file.name).slice(1).toLowerCase();
  const mime = file.type && file.type !== "application/octet-stream" ? file.type : "";
  if (PHOTO_TYPES[mime]) return { kind: "photo", mime, ext: PHOTO_TYPES[mime] };
  if (AUDIO_TYPES[mime]) return { kind: "audio", mime: "audio/mpeg", ext: "mp3" };
  if (["jpg", "jpeg"].includes(ext)) return { kind: "photo", mime: "image/jpeg", ext: "jpg" };
  if (ext === "png") return { kind: "photo", mime: "image/png", ext: "png" };
  if (ext === "webp") return { kind: "photo", mime: "image/webp", ext: "webp" };
  if (["heic", "heif"].includes(ext)) return { kind: "photo", mime: "image/heic", ext: "heic" };
  if (ext === "mp3") return { kind: "audio", mime: "audio/mpeg", ext: "mp3" };
  throw new ValidationError([{ path: "file", message: `${file.name}: use JPG, PNG, HEIC or MP3` }], "Unsupported file type");
}

const variantKey = (base: string, width: number) => `${base}-${width}.webp`;

interface Processed {
  kind: MediaKind;
  mime: string;
  fileName: string;
  originalKey: string;
  optimizedKey: string | null;
  width: number | null;
  height: number | null;
  bytes: number;
  optimizedBytes: number | null;
  durationSec: number | null;
}

/**
 * Stores the original and, for photos, web-optimized WebP variants
 * (640/1080/1600 wide). HEIC is converted to JPEG first.
 */
async function processFile(id: string, file: File, version: number): Promise<Processed> {
  const { kind, mime, ext } = detectType(file);
  const original = Buffer.from(await file.arrayBuffer());
  const max = kind === "photo" ? MAX_PHOTO_BYTES : MAX_AUDIO_BYTES;
  if (original.length > max) {
    throw new ValidationError([{ path: "file", message: `${file.name} is larger than ${max / 1024 / 1024} MB` }], "File too large");
  }

  const dir = `media/${id}/v${version}`;
  const originalKey = `${dir}/original.${ext}`;
  await storage.put(originalKey, original, mime);

  if (kind === "audio") {
    const meta = await parseBuffer(original, { mimeType: "audio/mpeg" }).catch(() => null);
    return {
      kind,
      mime,
      fileName: file.name,
      originalKey,
      optimizedKey: null,
      width: null,
      height: null,
      bytes: original.length,
      optimizedBytes: null,
      durationSec: meta?.format.duration ?? null,
    };
  }

  let source = original;
  if (ext === "heic") {
    source = Buffer.from(await heicConvert({ buffer: original, format: "JPEG", quality: 0.92 }));
  }
  const image = sharp(source, { failOn: "none" }).rotate(); // apply EXIF orientation
  const meta = await image.metadata();
  const isRotated = (meta.orientation ?? 1) >= 5;
  const width = (isRotated ? meta.height : meta.width) ?? null;
  const height = (isRotated ? meta.width : meta.height) ?? null;

  const base = `${dir}/w`;
  let optimizedBytes: number | null = null;
  for (const w of PHOTO_WIDTHS) {
    const out = await sharp(source, { failOn: "none" })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    await storage.put(variantKey(base, w), out, "image/webp");
    if (w === 1080) optimizedBytes = out.length;
  }

  return {
    kind,
    mime,
    fileName: file.name,
    originalKey,
    optimizedKey: base,
    width,
    height,
    bytes: original.length,
    optimizedBytes,
    durationSec: null,
  };
}

export async function ingestFile(file: File, eventId: string | null): Promise<Media> {
  const row = await db.media.create({
    data: { kind: "photo", fileName: file.name, originalKey: "", mime: "", bytes: 0, eventId },
  });
  try {
    const processed = await processFile(row.id, file, 1);
    return await db.media.update({ where: { id: row.id }, data: processed });
  } catch (err) {
    await db.media.delete({ where: { id: row.id } }).catch(() => undefined);
    await storage.deletePrefix(`media/${row.id}/`).catch(() => undefined);
    throw err;
  }
}

/** Replaces the file but keeps the id, so every usage picks up the new file. */
export async function replaceFile(media: Media, file: File): Promise<Media> {
  const version = Number(media.originalKey.match(/\/v(\d+)\//)?.[1] ?? 1) + 1;
  const processed = await processFile(media.id, file, version);
  const oldDir = media.originalKey.replace(/\/original\.[^/]+$/, "/");
  const updated = await db.media.update({ where: { id: media.id }, data: { ...processed, focalX: 0.5, focalY: 0.5 } });
  if (oldDir) await storage.deletePrefix(oldDir).catch(() => undefined);
  return updated;
}

export async function deleteMediaFiles(media: Media) {
  await storage.deletePrefix(`media/${media.id}/`);
}

// ── URLs / serialization ────────────────────────────────────────────────────

export function resolveMedia(m: Media): ResolvedMedia {
  if (m.kind === "audio" || !m.optimizedKey) {
    return {
      id: m.id,
      kind: m.kind as MediaKind,
      url: publicUrl(m.originalKey),
      focalX: m.focalX,
      focalY: m.focalY,
      alt: m.alt,
      width: m.width,
      height: m.height,
      durationSec: m.durationSec,
    };
  }
  const widths = PHOTO_WIDTHS.filter((w, i) => i === 0 || !m.width || w <= m.width * 1.2);
  return {
    id: m.id,
    kind: "photo",
    url: publicUrl(variantKey(m.optimizedKey, widths.includes(1080) ? 1080 : widths[widths.length - 1])),
    srcSet: widths.map((w) => `${publicUrl(variantKey(m.optimizedKey!, w))} ${Math.min(w, m.width ?? w)}w`).join(", "),
    width: m.width,
    height: m.height,
    focalX: m.focalX,
    focalY: m.focalY,
    alt: m.alt,
  };
}

export const thumbUrl = (m: Pick<Media, "kind" | "optimizedKey" | "originalKey">) =>
  m.kind === "photo" && m.optimizedKey ? publicUrl(variantKey(m.optimizedKey, 640)) : publicUrl(m.originalKey);

export function toMediaItem(
  m: Media & { event?: { name: string } | null; usages?: { eventId: string; slot: string; event: { name: string } }[] },
): MediaItem {
  return {
    ...resolveMedia(m),
    eventId: m.eventId,
    eventName: m.event?.name ?? null,
    fileName: m.fileName,
    mime: m.mime,
    bytes: m.bytes,
    optimizedBytes: m.optimizedBytes,
    originalUrl: `/api/admin/media/${m.id}/original`,
    thumbUrl: thumbUrl(m),
    usedIn: (m.usages ?? []).map((u) => ({ eventId: u.eventId, eventName: u.event.name, slot: u.slot })),
    uploadedAt: m.uploadedAt.toISOString(),
  };
}
