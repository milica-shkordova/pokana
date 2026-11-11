import { PrismaClient } from "@prisma/client";

// One client per process. In dev, `tsx watch` restarts the whole process on
// change, so there's no hot-reload connection leak to guard against.
export const db = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
});
