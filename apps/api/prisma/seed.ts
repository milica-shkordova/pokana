// Idempotent seed — safe to run repeatedly. Creates/updates:
//   • the first owner (ADMIN_EMAIL / ADMIN_PASSWORD from .env)
//   • the settings row
//   • the template catalog (all 9 designed templates; status drives the landing page)
//   • one published demo event per implemented template, with demo photos
//   • the live client migrated from the old codebase (Татјана & Драган)
// Existing events, catalog rows and settings are never overwritten, so
// edits made in the admin panel survive re-seeding.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, type Prisma } from "@prisma/client";
import { zonedToUtc, type EventContent, type TemplateCategory, type TemplateStatus } from "@pokanito/shared";
import { defaultSections, defaultTheme, templateList, type TemplateDefinition } from "@pokanito/templates/definitions";

const db = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(here, "seed-assets");

try {
  process.loadEnvFile?.(".env");
} catch {
  /* env injected by the platform */
}

// Imported lazily so env is loaded first.
const { hashPassword } = await import("../src/lib/crypto");
const { ingestFile } = await import("../src/lib/media");
const { syncMediaUsage, computeExpiresAt } = await import("../src/lib/events");

/** The gallery as designed (Templates.dc.html). Status: what the landing page shows. */
const CATALOG: { id: string; name: string; category: TemplateCategory; status: TemplateStatus; description: string }[] = [
  { id: "elegant-wedding", name: "Elegant Wedding", category: "wedding", status: "live", description: "Countdown, program, RSVP with menu and map." },
  { id: "rustic-wedding", name: "Rustic Wedding", category: "wedding", status: "coming-soon", description: "Warm kraft paper, terracotta and olive — for garden and vineyard weddings." },
  { id: "minimal-wedding", name: "Modern Minimal Wedding", category: "wedding", status: "coming-soon", description: "Big type, black & white photography, editorial calm." },
  { id: "kids-birthday", name: "Kids Birthday Bash", category: "birthday", status: "live", description: "Bright and playful, easy for parents to RSVP." },
  { id: "milestone-birthday", name: "Milestone Birthday", category: "birthday", status: "coming-soon", description: "Black and gold for the big 30, 40, 50." },
  { id: "conference-summit", name: "Conference & Summit", category: "corporate", status: "live", description: "Agenda, speakers and registration in one link." },
  { id: "product-launch", name: "Product Launch", category: "corporate", status: "coming-soon", description: "A bold, dark launch page with countdown and registration." },
  { id: "classic-christening", name: "Classic Christening", category: "christening", status: "live", description: "Soft and timeless, for baptisms and naming days." },
  { id: "floral-christening", name: "Floral Baptism", category: "christening", status: "coming-soon", description: "Blush and sage with hand-drawn florals." },
];

async function seedOwner() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("! ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping owner account.");
    return null;
  }
  if (password.length < 10) console.warn("! ADMIN_PASSWORD should be at least 10 characters.");
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash: await hashPassword(password), acceptedAt: new Date() },
    create: { email, name: process.env.ADMIN_NAME ?? "Owner", role: "owner", passwordHash: await hashPassword(password), acceptedAt: new Date() },
  });
  console.log(`✓ owner ${email}`);
  return user;
}

const mediaCache = new Map<string, string>();
async function seedAsset(fileName: string): Promise<string> {
  const cached = mediaCache.get(fileName);
  if (cached) return cached;
  const existing = await db.media.findFirst({ where: { fileName: `seed:${fileName}` } });
  if (existing) {
    mediaCache.set(fileName, existing.id);
    return existing.id;
  }
  const buf = await readFile(path.join(ASSETS, fileName));
  const type = fileName.endsWith(".mp3") ? "audio/mpeg" : "image/jpeg";
  const media = await ingestFile(new File([buf], fileName, { type }), null);
  await db.media.update({ where: { id: media.id }, data: { fileName: `seed:${fileName}` } });
  mediaCache.set(fileName, media.id);
  return media.id;
}

async function seedEvent(def: TemplateDefinition, data: {
  slug: string;
  name: string;
  date: string;
  time: string;
  languages?: ("mk" | "en")[];
  content: EventContent;
  theme?: Record<string, string>;
  isDemo: boolean;
  clientName?: string;
  rsvpEmails?: string[];
  status?: "live" | "past";
}) {
  const existing = await db.event.findUnique({ where: { slug: data.slug } });
  if (existing) {
    console.log(`· event /${data.slug} exists — left as is`);
    return existing;
  }
  const eventDate = new Date(zonedToUtc(data.date, data.time));
  const settings = await db.settings.findUniqueOrThrow({ where: { id: "settings" } });
  const event = await db.event.create({
    data: {
      slug: data.slug,
      templateId: def.id,
      name: data.name,
      clientName: data.clientName ?? (data.isDemo ? "Pokanito demo" : ""),
      eventDate,
      languages: data.languages ?? def.defaultLanguages,
      content: data.content as unknown as Prisma.InputJsonValue,
      theme: { ...defaultTheme(def), ...data.theme },
      sections: defaultSections(def).map((s) => (s.id === "music" ? { ...s, enabled: !!data.content.music?.mediaId } : s)) as unknown as Prisma.InputJsonValue,
      rsvpEmails: data.rsvpEmails ?? [],
      rsvpDeadline: new Date(eventDate.getTime() - 14 * 86_400_000),
      status: data.status ?? "live",
      isDemo: data.isDemo,
      noindex: true,
      clientApproved: true,
      publishedAt: new Date(),
      expiresAt: data.isDemo ? null : computeExpiresAt(eventDate, settings.keepOnlineMonths),
    },
  });
  await syncMediaUsage(event.id, data.content);
  console.log(`✓ event /${data.slug}`);
  return event;
}

async function demoContent(def: TemplateDefinition): Promise<EventContent> {
  const content: EventContent = JSON.parse(JSON.stringify({ ...def.defaultContent, ...def.demo.content }));
  content.photos = {};
  for (const [slot, file] of Object.entries(def.demo.photos ?? {})) content.photos[slot] = await seedAsset(file);
  if (def.demo.music) content.music = { ...content.music, mediaId: await seedAsset(def.demo.music) };
  // Demo people photos (speakers) reuse the demo assets if referenced by file name.
  for (const p of content.people?.items ?? []) if (p.photo?.includes(".")) p.photo = await seedAsset(p.photo);
  return content;
}

async function main() {
  await seedOwner();
  await db.settings.upsert({
    where: { id: "settings" },
    update: {},
    create: { id: "settings", defaultMenuOptions: ["Месо", "Риба", "Вегетаријанско"] },
  });

  let order = 10;
  for (const row of CATALOG) {
    await db.template.upsert({
      where: { id: row.id },
      update: {},
      create: { ...row, sortOrder: order },
    });
    order += 10;
  }
  console.log(`✓ catalog (${CATALOG.length} templates)`);

  for (const def of templateList) {
    if (!(await db.template.findUnique({ where: { id: def.id } }))) {
      await db.template.create({ data: { id: def.id, name: def.name, category: def.category, status: "draft", description: def.tagline, sortOrder: order += 10 } });
    }
    const event = await seedEvent(def, {
      ...def.demo,
      content: await demoContent(def),
      theme: def.demo.theme,
      isDemo: true,
    });
    await db.template.updateMany({ where: { id: def.id, demoEventId: null }, data: { demoEventId: event.id } });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
