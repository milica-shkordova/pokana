import { serve } from "@hono/node-server";
import { env } from "./env";
import { createApp } from "./app";
import { db } from "./db";
import { startJobs } from "./jobs";

const app = createApp();

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`▲ Momentelo API listening on http://localhost:${info.port}/api`);
  if (!env.RESEND_API_KEY) console.log("  (no RESEND_API_KEY — emails are printed here instead of sent)");
  startJobs();
});

async function shutdown() {
  server.close();
  await db.$disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
