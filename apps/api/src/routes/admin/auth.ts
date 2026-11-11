import { Hono } from "hono";
import { acceptInviteSchema, loginSchema, passwordChangeSchema, type CurrentUser } from "@momentelo/shared";
import { db } from "../../db";
import { endSession, requireUser, startSession, toTeamMember, type AuthEnv } from "../../auth";
import { hashPassword, verifyPassword } from "../../lib/crypto";
import { body, errorBody } from "../../lib/http";
import { rateLimit } from "../../lib/rate-limit";

export const authRoutes = new Hono<AuthEnv>();

const loginLimiter = rateLimit({ name: "login", windowMs: 15 * 60_000, max: 10 });

authRoutes.post("/login", loginLimiter, async (c) => {
  const { email, password } = await body(c, loginSchema);
  const user = await db.user.findUnique({ where: { email } });
  // Same response for unknown email, pending invite and wrong password.
  if (!user?.passwordHash || !user.acceptedAt || !(await verifyPassword(password, user.passwordHash))) {
    return c.json(errorBody("Invalid email or password"), 401);
  }
  startSession(c, user.id);
  return c.json<CurrentUser>(toTeamMember(user));
});

authRoutes.post("/logout", (c) => {
  endSession(c);
  return c.body(null, 204);
});

authRoutes.get("/me", requireUser, (c) => c.json<CurrentUser>(toTeamMember(c.get("user"))));

authRoutes.post("/password", requireUser, async (c) => {
  const input = await body(c, passwordChangeSchema);
  const user = c.get("user");
  if (!user.passwordHash || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
    return c.json(errorBody("Current password is wrong", [{ path: "currentPassword", message: "Wrong password" }]), 400);
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(input.newPassword) } });
  return c.body(null, 204);
});

/** Invite landing page: who is this invite for? */
authRoutes.get("/invite", loginLimiter, async (c) => {
  const token = c.req.query("token") ?? "";
  const user = token ? await db.user.findUnique({ where: { inviteToken: token } }) : null;
  if (!user || !user.inviteExpiresAt || user.inviteExpiresAt < new Date()) {
    return c.json(errorBody("This invite link is invalid or has expired"), 404);
  }
  return c.json({ email: user.email, name: user.name });
});

authRoutes.post("/accept-invite", loginLimiter, async (c) => {
  const input = await body(c, acceptInviteSchema);
  const user = await db.user.findUnique({ where: { inviteToken: input.token } });
  if (!user || !user.inviteExpiresAt || user.inviteExpiresAt < new Date()) {
    return c.json(errorBody("This invite link is invalid or has expired"), 404);
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name: input.name,
      passwordHash: await hashPassword(input.password),
      acceptedAt: new Date(),
      inviteToken: null,
      inviteExpiresAt: null,
    },
  });
  startSession(c, updated.id);
  return c.json<CurrentUser>(toTeamMember(updated));
});
