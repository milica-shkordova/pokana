import type { Locale, RsvpGuest } from "@momentelo/shared";
import { EVENT_TIMEZONE, utcToZoned } from "@momentelo/shared";
import { db } from "./db";
import { env } from "./env";
import { digestEmail, rsvpEmail, type RsvpEmailData } from "./lib/emails";
import { sendMail } from "./lib/mailer";
import { getSettings } from "./lib/settings";
import { eventEmails, eventLanguages, isPastDate } from "./lib/events";
import { revalidate } from "./lib/revalidate";

// In-process background jobs (single API instance). Every minute:
//   • send pending RSVP emails, retrying failures with backoff
//   • send the clients' daily digest once a day (if enabled in Settings)
//   • move live events to "past" the day after the event

const MAX_ATTEMPTS = 6;
let running = false;
let kickTimer: NodeJS.Timeout | null = null;

type RsvpRow = Awaited<ReturnType<typeof db.rsvp.findFirstOrThrow>>;

const toEmailData = (r: RsvpRow, eventName: string, locale: Locale): RsvpEmailData => ({
  eventName,
  locale,
  name: r.name,
  attending: r.attending,
  totalGuests: r.totalGuests,
  guests: (r.guests as RsvpGuest[] | null) ?? [],
  adults: r.adults,
  children: r.children,
  allergies: r.allergies,
  message: r.message,
  extra: (r.extra as RsvpEmailData["extra"]) ?? {},
});

/** Sends every RSVP email that is due. */
export async function processEmailQueue() {
  if (running) return;
  running = true;
  try {
    const settings = await getSettings();
    const due = await db.rsvp.findMany({
      where: { emailedAt: null, emailAttempts: { lt: MAX_ATTEMPTS }, nextEmailAt: { lte: new Date() } },
      include: { event: true },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    for (const r of due) {
      // Clients on the daily digest get one summary instead of one email per reply.
      const clientTo = settings.clientDailyDigest ? [] : eventEmails(r.event);
      const cc = settings.ccOwnerOnRsvp ? [settings.contactEmail] : [];
      if (!clientTo.length && !cc.length) {
        await db.rsvp.update({
          where: { id: r.id },
          data: settings.clientDailyDigest
            ? { emailedAt: new Date(), emailError: null }
            : { emailAttempts: MAX_ATTEMPTS, emailError: "No RSVP email address set for this event", nextEmailAt: null },
        });
        continue;
      }
      try {
        const locale = (r.locale as Locale | null) ?? eventLanguages(r.event)[0] ?? "mk";
        await sendMail(rsvpEmail(settings, clientTo.length ? clientTo : cc, clientTo.length ? cc : [], toEmailData(r, r.event.name, locale)));
        await db.rsvp.update({ where: { id: r.id }, data: { emailedAt: new Date(), emailError: null, nextEmailAt: null } });
      } catch (err) {
        const attempts = r.emailAttempts + 1;
        const backoffMin = 2 ** attempts; // 2, 4, 8, 16, 32 min
        await db.rsvp.update({
          where: { id: r.id },
          data: {
            emailAttempts: attempts,
            emailError: (err as Error).message.slice(0, 300),
            nextEmailAt: attempts < MAX_ATTEMPTS ? new Date(Date.now() + backoffMin * 60_000) : null,
          },
        });
        console.warn(`[rsvp-email] ${r.id} attempt ${attempts} failed: ${(err as Error).message}`);
      }
    }
  } finally {
    running = false;
  }
}

/** Runs the queue soon (debounced) — called right after an RSVP is saved. */
export function kickEmailQueue() {
  if (env.JOBS === "off") return;
  if (kickTimer) clearTimeout(kickTimer);
  kickTimer = setTimeout(() => void processEmailQueue().catch((e) => console.error("[rsvp-email]", e)), 500);
}

/** Once a day at DIGEST_HOUR (Skopje): one summary email per event with new replies. */
export async function processDigest(now = new Date()) {
  const settings = await getSettings();
  if (!settings.clientDailyDigest) return;
  const row = await db.settings.findUnique({ where: { id: "settings" } });
  const today = utcToZoned(now.toISOString(), EVENT_TIMEZONE);
  const hour = Number(today.time.slice(0, 2));
  const lastDay = row?.lastDigestAt ? utcToZoned(row.lastDigestAt.toISOString()).date : null;
  if (hour < env.DIGEST_HOUR || lastDay === today.date) return;

  const pending = await db.rsvp.findMany({ where: { digestedAt: null, event: { isDemo: false } }, include: { event: true } });
  const byEvent = new Map<string, RsvpRow[]>();
  for (const r of pending) byEvent.set(r.eventId, [...(byEvent.get(r.eventId) ?? []), r]);

  for (const [eventId, rows] of byEvent) {
    const event = rows[0] && (rows[0] as RsvpRow & { event: { name: string } }).event;
    const ev = await db.event.findUnique({ where: { id: eventId } });
    if (!ev || !event) continue;
    const to = eventEmails(ev);
    if (to.length) {
      const all = await db.rsvp.findMany({ where: { eventId } });
      const locale = eventLanguages(ev)[0] ?? "mk";
      try {
        await sendMail(
          digestEmail(settings, to, ev.name, locale, rows.map((r) => toEmailData(r, ev.name, locale)), {
            responses: all.length,
            attendingGuests: all.filter((r) => r.attending).reduce((s, r) => s + r.totalGuests, 0),
            declined: all.filter((r) => !r.attending).length,
          }),
        );
      } catch (err) {
        console.warn(`[digest] ${ev.slug}: ${(err as Error).message}`);
        continue; // retried next run
      }
    }
    await db.rsvp.updateMany({ where: { id: { in: rows.map((r) => r.id) } }, data: { digestedAt: new Date() } });
  }
  await db.settings.update({ where: { id: "settings" }, data: { lastDigestAt: now } });
}

/** Live → past the day after the event. */
export async function sweepPastEvents(now = new Date()) {
  const live = await db.event.findMany({ where: { status: "live", eventDate: { lt: now } }, select: { id: true, slug: true, eventDate: true } });
  const past = live.filter((e) => isPastDate(e.eventDate, now));
  if (!past.length) return;
  await db.event.updateMany({ where: { id: { in: past.map((e) => e.id) } }, data: { status: "past" } });
  revalidate(...past.map((e) => `/${e.slug}`));
}

export function startJobs() {
  if (env.JOBS === "off") return;
  const tick = async () => {
    for (const [name, job] of [
      ["rsvp-email", processEmailQueue],
      ["digest", processDigest],
      ["past-events", sweepPastEvents],
    ] as const) {
      await job().catch((err: unknown) => console.error(`[jobs:${name}]`, err));
    }
  };
  void tick();
  setInterval(tick, 60_000).unref();
}
