import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { Prisma } from "@prisma/client";
import { requireUser, type AuthEnv } from "./auth";
import { errorBody, ValidationError } from "./lib/http";
import { publicRoutes } from "./routes/public";
import { authRoutes } from "./routes/admin/auth";
import { teamRoutes } from "./routes/admin/team";
import { eventRoutes, rsvpRoutes } from "./routes/admin/events";
import { templateRoutes } from "./routes/admin/templates";
import { leadRoutes } from "./routes/admin/leads";
import { mediaRoutes } from "./routes/admin/media";
import { settingsRoutes } from "./routes/admin/settings";

// Route map:
//   /api/health
//   /api/public/*   — no auth; used by the public site (apps/web)
//   /api/admin/*    — team session cookie; used by the admin panel (apps/admin)
//
// Both Next.js apps proxy /api/* here via rewrites, so browsers only ever
// talk to their own origin — no CORS, and the session cookie is first-party.

export function createApp() {
  const app = new Hono().basePath("/api");

  app.use("*", logger());
  app.use("*", secureHeaders({ crossOriginResourcePolicy: "cross-origin" }));

  app.get("/health", (c) => c.json({ ok: true }));
  app.route("/public", publicRoutes);

  const admin = new Hono<AuthEnv>();
  admin.route("/auth", authRoutes); // login / invite are public; /me & /password guard themselves
  admin.use("*", async (c, next) => (c.req.path.startsWith("/api/admin/auth/") ? next() : requireUser(c, next)));
  admin.route("/events", eventRoutes);
  admin.route("/rsvps", rsvpRoutes);
  admin.route("/templates", templateRoutes);
  admin.route("/leads", leadRoutes);
  admin.route("/media", mediaRoutes);
  admin.route("/settings", settingsRoutes);
  admin.route("/team", teamRoutes);
  app.route("/admin", admin);

  app.notFound((c) => c.json(errorBody("Not found"), 404));

  app.onError((err, c) => {
    if (err instanceof ValidationError) return c.json(errorBody(err.message, err.issues), 400);
    if (err instanceof HTTPException) return c.json(errorBody(err.message), err.status);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return c.json(errorBody("Not found"), 404);
    }
    console.error(err);
    return c.json(errorBody("Internal server error"), 500);
  });

  return app;
}
