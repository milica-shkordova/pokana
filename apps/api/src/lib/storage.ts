import { createReadStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../env";

// Storage for uploaded media. "local" writes under MEDIA_DIR (dev, single
// server); "s3" talks to any S3-compatible bucket (Cloudflare R2, AWS, …).

export interface StoredObject {
  body: ReadableStream;
  contentType?: string;
  size?: number;
  /** Set when a byte range was requested and served. */
  range?: { start: number; end: number; total: number };
}

export interface ByteRange {
  start: number;
  end?: number;
}

export interface Storage {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string, range?: ByteRange): Promise<StoredObject | null>;
  getBuffer(key: string): Promise<Buffer | null>;
  /** Deletes every object under `prefix` (e.g. "media/<id>/"). */
  deletePrefix(prefix: string): Promise<void>;
}

const safeKey = (key: string) => {
  const normalized = path.posix.normalize(key);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) throw new Error("Invalid storage key");
  return normalized;
};

function localStorage(root: string): Storage {
  const file = (key: string) => path.join(root, ...safeKey(key).split("/"));
  return {
    async put(key, data) {
      await mkdir(path.dirname(file(key)), { recursive: true });
      await writeFile(file(key), data);
    },
    async get(key, range) {
      try {
        const s = await stat(file(key));
        if (range && range.start < s.size) {
          const end = Math.min(range.end ?? s.size - 1, s.size - 1);
          const stream = createReadStream(file(key), { start: range.start, end });
          return { body: Readable.toWeb(stream) as ReadableStream, size: s.size, range: { start: range.start, end, total: s.size } };
        }
        return { body: Readable.toWeb(createReadStream(file(key))) as ReadableStream, size: s.size };
      } catch {
        return null;
      }
    },
    async getBuffer(key) {
      return readFile(file(key)).catch(() => null);
    },
    async deletePrefix(prefix) {
      await rm(file(prefix), { recursive: true, force: true });
    },
  };
}

function s3Storage(): Storage {
  const client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: { accessKeyId: env.S3_ACCESS_KEY_ID!, secretAccessKey: env.S3_SECRET_ACCESS_KEY! },
  });
  const Bucket = env.S3_BUCKET!;
  return {
    async put(key, data, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket,
          Key: safeKey(key),
          Body: data,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    },
    async get(key, range) {
      try {
        const res = await client.send(
          new GetObjectCommand({
            Bucket,
            Key: safeKey(key),
            Range: range ? `bytes=${range.start}-${range.end ?? ""}` : undefined,
          }),
        );
        if (!res.Body) return null;
        const m = res.ContentRange?.match(/bytes (\d+)-(\d+)\/(\d+)/);
        return {
          body: res.Body.transformToWebStream() as ReadableStream,
          contentType: res.ContentType,
          size: res.ContentLength,
          range: m ? { start: Number(m[1]), end: Number(m[2]), total: Number(m[3]) } : undefined,
        };
      } catch {
        return null;
      }
    },
    async getBuffer(key) {
      try {
        const res = await client.send(new GetObjectCommand({ Bucket, Key: safeKey(key) }));
        return res.Body ? Buffer.from(await res.Body.transformToByteArray()) : null;
      } catch {
        return null;
      }
    },
    async deletePrefix(prefix) {
      const list = await client.send(new ListObjectsV2Command({ Bucket, Prefix: safeKey(prefix) }));
      const keys = (list.Contents ?? []).map((o) => ({ Key: o.Key! }));
      if (keys.length) await client.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects: keys } }));
    },
  };
}

export const storage: Storage = env.MEDIA_DRIVER === "s3" ? s3Storage() : localStorage(env.MEDIA_DIR);

/** Public URL for a stored object. Relative by default (both Next apps proxy /api/public). */
export function publicUrl(key: string): string {
  return env.MEDIA_PUBLIC_URL ? `${env.MEDIA_PUBLIC_URL.replace(/\/$/, "")}/${key}` : `/api/public/media/${key}`;
}
