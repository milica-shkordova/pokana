import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { env } from "../env";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;

// ── Passwords (scrypt, no native deps) ──────────────────────────────────────
// Stored as "scrypt$<salt b64url>$<hash b64url>".

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length);
  return timingSafeEqual(actual, expected);
}

/** URL-safe random token (invites). */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

// ── Signed tokens (HMAC-SHA256) ─────────────────────────────────────────────
// Format: "<payload b64url>.<signature b64url>". Used for admin sessions and
// short-lived preview links. `purpose` is part of the signed payload so a
// preview token can never be replayed as a session (and vice versa).

function sign(data: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(data).digest("base64url");
}

export function createToken(purpose: string, subject: string, ttlSeconds: number): string {
  const payload = Buffer.from(
    JSON.stringify({ p: purpose, sub: subject, exp: Math.floor(Date.now() / 1000) + ttlSeconds }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined, purpose: string): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      p: string;
      sub: string;
      exp: number;
    };
    if (data.p !== purpose || data.exp < Date.now() / 1000) return null;
    return data.sub;
  } catch {
    return null;
  }
}
