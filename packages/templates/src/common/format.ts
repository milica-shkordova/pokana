import { utcToZoned, type Locale } from "@pokanito/shared";

/** "сабота" → "Сабота". */
export const cap = (s: string) => (s ? s.charAt(0).toLocaleUpperCase() + s.slice(1) : s);

/** 24h time of the event, e.g. "16:00". */
export const TIME: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" };

/** Picks a per-locale value from a small copy table. */
export const pick = <T,>(table: Record<Locale, T>, locale: Locale): T => table[locale] ?? table.mk;

/** "Ана & Марко" → "А & М". */
export const initials = (names: string) =>
  names
    .split("&")
    .map((n) => n.trim().charAt(0))
    .filter(Boolean)
    .join(" & ");

/** Day/month/year of the event in Skopje time, zero-padded: { d: "18", m: "09", y: "2027", yy: "27" }. */
export function dateParts(iso: string) {
  const [y, m, d] = utcToZoned(iso).date.split("-");
  return { d, m, y, yy: y.slice(2) };
}
