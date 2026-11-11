import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { User } from "@prisma/client";
import type { TeamMember, UserRole } from "@momentelo/shared";
import { db } from "./db";
import { env } from "./env";
import { createToken, verifyToken } from "./lib/crypto";
import { errorBody } from "./lib/http";

export const SESSION_COOKIE = "momentelo_admin";
const SESSION_TTL = 60 * 60 * 24 * 14; // 14 days
const SESSION_PURPOSE = "admin-session";

export type AuthEnv = { Variables: { user: User } };

export function startSession(c: Context, userId: string): void {
  setCookie(c, SESSION_COOKIE, createToken(SESSION_PURPOSE, userId, SESSION_TTL), {
    httpOnly: true,
    sameSite: "Lax",
    secure: env.isProd,
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export function endSession(c: Context): void {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

/**
 * Requires a valid session for a user who is still on the team (the users
 * table is the allow-list — removing someone revokes access immediately).
 */
export const requireUser: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const bearer = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const userId = verifyToken(getCookie(c, SESSION_COOKIE) ?? bearer, SESSION_PURPOSE);
  const user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;
  if (!user || !user.acceptedAt) return c.json(errorBody("Not authenticated"), 401);
  c.set("user", user);
  await next();
};

export const requireOwner: MiddlewareHandler<AuthEnv> = async (c, next) => {
  if (c.get("user").role !== "owner") return c.json(errorBody("Only owners can do this"), 403);
  await next();
};

export function toTeamMember(u: User): TeamMember {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as UserRole,
    invitedAt: u.invitedAt.toISOString(),
    acceptedAt: u.acceptedAt?.toISOString() ?? null,
  };
}

// ── Preview links ───────────────────────────────────────────────────────────
// Lets the team (and the client, for approval) open a draft without
// publishing it. Tokens are bound to one event id and expire.

const PREVIEW_PURPOSE = "event-preview";
export const PREVIEW_TTL = 60 * 60 * 24 * 14; // 14 days — long enough for client approval

export const createPreviewToken = (eventId: string) => createToken(PREVIEW_PURPOSE, eventId, PREVIEW_TTL);

export const verifyPreviewToken = (token: string | undefined, eventId: string) =>
  verifyToken(token, PREVIEW_PURPOSE) === eventId;

/** Proof that a guest entered the access code (sent back on RSVP). */
const UNLOCK_PURPOSE = "event-unlock";
export const createUnlockToken = (eventId: string) => createToken(UNLOCK_PURPOSE, eventId, 60 * 60 * 24 * 30);
export const verifyUnlockToken = (token: string | undefined, eventId: string) =>
  verifyToken(token, UNLOCK_PURPOSE) === eventId;
