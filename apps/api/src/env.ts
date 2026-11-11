import path from "node:path";
import { z } from "zod";

// Load apps/api/.env when present (Node ≥ 20.12). In production the platform
// usually injects real environment variables instead.
try {
  process.loadEnvFile?.(".env");
} catch {
  // no .env file — fine
}

const isProd = process.env.NODE_ENV === "production";
const DEV_SECRET = "dev-only-secret-change-me-dev-only-secret-change-me";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters")
    .default(isProd ? "" : DEV_SECRET)
    .refine((v) => !isProd || v !== DEV_SECRET, "Set a real AUTH_SECRET in production"),

  /** Public site, e.g. https://momentelo.mk (preview links, revalidation, emails). */
  WEB_URL: z.string().url().default("http://localhost:3000"),
  /** Admin panel (invite links). */
  ADMIN_URL: z.string().url().default("http://localhost:3000/admin"),
  REVALIDATE_SECRET: z.string().optional(),

  /** Resend API key. Without it, emails are printed to the console (dev). */
  RESEND_API_KEY: z.string().optional(),

  /** Media storage: "local" (apps/api/storage) or "s3" (any S3-compatible, e.g. Cloudflare R2). */
  MEDIA_DRIVER: z.enum(["local", "s3"]).default("local"),
  MEDIA_DIR: z.string().default(path.resolve("storage")),
  /** Public base URL for media (CDN / R2 public bucket). Default: served through /api/public/media. */
  MEDIA_PUBLIC_URL: z.string().url().optional(),
  MEDIA_QUOTA_GB: z.coerce.number().positive().default(10),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default("auto"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  /** Hour of day (Skopje time) the clients' daily RSVP digest goes out. */
  DIGEST_HOUR: z.coerce.number().int().min(0).max(23).default(20),
  /** Disable the background jobs (e.g. in a second API instance). */
  JOBS: z.enum(["on", "off"]).default("on"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("✖ Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

if (parsed.data.MEDIA_DRIVER === "s3" && !(parsed.data.S3_BUCKET && parsed.data.S3_ACCESS_KEY_ID)) {
  console.error("✖ MEDIA_DRIVER=s3 needs S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY (and S3_ENDPOINT for R2).");
  process.exit(1);
}

export const env = { ...parsed.data, isProd };
