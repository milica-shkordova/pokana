import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { inviteSchema, userUpdateSchema, type TeamMember } from "@momentelo/shared";
import { db } from "../../db";
import { requireOwner, toTeamMember, type AuthEnv } from "../../auth";
import { env } from "../../env";
import { randomToken } from "../../lib/crypto";
import { inviteEmail } from "../../lib/emails";
import { body, notFound } from "../../lib/http";
import { sendMail } from "../../lib/mailer";
import { getSettings } from "../../lib/settings";

export const teamRoutes = new Hono<AuthEnv>();

const INVITE_TTL_MS = 7 * 24 * 3600_000;

teamRoutes.get("/", async (c) => {
  const users = await db.user.findMany({ orderBy: [{ acceptedAt: "asc" }, { invitedAt: "asc" }] });
  return c.json<TeamMember[]>(users.map(toTeamMember));
});

async function sendInvite(userId: string, inviter: string) {
  const token = randomToken();
  const user = await db.user.update({
    where: { id: userId },
    data: { inviteToken: token, inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS), invitedAt: new Date() },
  });
  const link = `${env.ADMIN_URL}/accept-invite?token=${token}`;
  let emailError: string | null = null;
  try {
    await sendMail(inviteEmail(await getSettings(), user.email, inviter, link));
  } catch (err) {
    emailError = (err as Error).message;
  }
  return { user, link, emailError };
}

teamRoutes.post("/", requireOwner, async (c) => {
  const input = await body(c, inviteSchema);
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing?.acceptedAt) throw new HTTPException(409, { message: `${input.email} is already on the team` });
  const user =
    existing ??
    (await db.user.create({ data: { email: input.email, name: input.name ?? null, role: input.role } }));
  const me = c.get("user");
  const { user: invited, link, emailError } = await sendInvite(user.id, me.name ?? me.email);
  // The link is returned too, so the owner can share it directly if email isn't set up yet.
  return c.json({ member: toTeamMember(invited), link, emailError }, 201);
});

teamRoutes.post("/:id/resend", requireOwner, async (c) => {
  const user = await db.user.findUnique({ where: { id: c.req.param("id") } });
  if (!user) notFound("Team member");
  if (user.acceptedAt) throw new HTTPException(409, { message: "Already accepted" });
  const me = c.get("user");
  const { user: invited, link, emailError } = await sendInvite(user.id, me.name ?? me.email);
  return c.json({ member: toTeamMember(invited), link, emailError });
});

teamRoutes.patch("/:id", requireOwner, async (c) => {
  const input = await body(c, userUpdateSchema);
  const id = c.req.param("id");
  if (input.role === "editor") {
    const owners = await db.user.count({ where: { role: "owner", acceptedAt: { not: null }, id: { not: id } } });
    if (owners === 0) throw new HTTPException(409, { message: "The team needs at least one owner" });
  }
  const user = await db.user.update({ where: { id }, data: input }).catch(() => notFound("Team member"));
  return c.json(toTeamMember(user));
});

teamRoutes.delete("/:id", requireOwner, async (c) => {
  const id = c.req.param("id");
  if (id === c.get("user").id) throw new HTTPException(409, { message: "You can't remove yourself" });
  await db.user.delete({ where: { id } }).catch(() => notFound("Team member"));
  return c.body(null, 204);
});
