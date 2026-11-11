import { EVENT_TIMEZONE, type Locale } from "./constants";

// Event dates are stored as UTC instants but always entered and shown in
// Europe/Skopje, regardless of where the admin or the guest is.

function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** "2027-09-18" + "16:00" in Skopje → UTC ISO string. */
export function zonedToUtc(date: string, time = "00:00", timeZone = EVENT_TIMEZONE): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh || 0, mm || 0);
  // Two passes handle DST transitions correctly.
  let offset = zoneOffsetMinutes(new Date(guess), timeZone);
  offset = zoneOffsetMinutes(new Date(guess - offset * 60000), timeZone);
  return new Date(guess - offset * 60000).toISOString();
}

/** UTC ISO → { date: "2027-09-18", time: "16:00" } in Skopje. */
export function utcToZoned(iso: string, timeZone = EVENT_TIMEZONE): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

// Chrome ships a reduced ICU without Macedonian, so Intl silently falls back
// to English there ("May 15" on an MK invitation). Macedonian is therefore
// built from en-GB parts (always available) with our own month/day names.
const MK_MONTHS = ["јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"];
const MK_MONTHS_SHORT = ["јан", "фев", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "ное", "дек"];
const MK_WEEKDAYS: Record<string, [string, string]> = {
  Monday: ["понеделник", "пон"],
  Tuesday: ["вторник", "вто"],
  Wednesday: ["среда", "сре"],
  Thursday: ["четврток", "чет"],
  Friday: ["петок", "пет"],
  Saturday: ["сабота", "саб"],
  Sunday: ["недела", "нед"],
};
const EN_WEEKDAY_SHORT: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };

/** Formats an event instant in Skopje time, e.g. "18 септември 2027" / "18 September 2027". */
export function formatEventDate(
  iso: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const opts: Intl.DateTimeFormatOptions = { timeZone: EVENT_TIMEZONE, ...options };
  const date = new Date(iso);
  if (locale === "en") return new Intl.DateTimeFormat("en-GB", opts).format(date);

  const monthIndex = Number(utcToZoned(iso).date.slice(5, 7)) - 1;
  const parts = new Intl.DateTimeFormat("en-GB", opts).formatToParts(date);
  return parts
    .map((p) => {
      if (p.type === "month" && (opts.month === "long" || opts.month === "short")) {
        return opts.month === "long" ? MK_MONTHS[monthIndex] : MK_MONTHS_SHORT[monthIndex];
      }
      if (p.type === "weekday") {
        const full = EN_WEEKDAY_SHORT[p.value] ?? p.value;
        const names = MK_WEEKDAYS[full];
        return names ? (opts.weekday === "long" ? names[0] : names[1]) : p.value;
      }
      // en-GB writes "Saturday 9 January" — Macedonian uses "сабота, 9 јануари".
      if (p.type === "literal" && p.value === " " && parts[parts.indexOf(p) - 1]?.type === "weekday") return ", ";
      return p.value;
    })
    .join("");
}

/** Countdown parts until `iso` (all zero once it has passed). */
export function countdownParts(iso: string, now = Date.now()) {
  const diff = Math.max(0, new Date(iso).getTime() - now);
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
