import { Hono } from "hono";
import { settingsSchema, type Settings } from "@pokanito/shared";
import { db } from "../../db";
import type { AuthEnv } from "../../auth";
import { body } from "../../lib/http";
import { getSettings, getSettingsRow } from "../../lib/settings";
import { revalidate } from "../../lib/revalidate";

export const settingsRoutes = new Hono<AuthEnv>();

settingsRoutes.get("/", async (c) => c.json<Settings>(await getSettings()));

settingsRoutes.put("/", async (c) => {
  const input = await body(c, settingsSchema);
  await getSettingsRow();
  await db.settings.update({ where: { id: "settings" }, data: input });
  revalidate("/"); // business profile shows on the landing page
  return c.json<Settings>(await getSettings());
});
