import { EVENT_TIMEZONE } from "@momentelo/shared";

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: EVENT_TIMEZONE, day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: EVENT_TIMEZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "18 Sep 2027" in Skopje time. */
export const formatDate = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : "—");
export const formatDateTime = (iso: string | null | undefined) => (iso ? dateTimeFmt.format(new Date(iso)) : "—");

export function timeAgo(iso: string | number, now = Date.now()): string {
  const s = Math.round((now - new Date(iso).getTime()) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 14) return "Last week";
  if (d < 30) return `${Math.round(d / 7)} weeks ago`;
  return formatDate(new Date(iso).toISOString());
}

export function formatBytes(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${Math.round(n / 1024)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

export function formatDuration(sec: number | null | undefined): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Placeholder thumbnail tones (Main.dc.html). */
export const TONES = ["#C9B79C", "#E5B9A8", "#9FB3A3", "#B7C2D6", "#D8C6E0", "#CDBB8A"]; // event thumbnails (Main.dc.html)
export const toneFor = (key: string) => TONES[[...key].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];

export const parseEmails = (text: string) =>
  text
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
