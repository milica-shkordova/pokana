import { pad2 } from "./dates";

// Small formatting / parsing helpers used by more than one app.

export function formatBytes(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${Math.round(n / 1024)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

/** Track length, e.g. "3:07". */
export function formatDuration(sec: number | null | undefined): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${pad2(s)}`;
}

/** "a@x.mk, b@y.com; c@z.org" → lower-cased addresses (not validated). */
export const parseEmails = (text: string) =>
  text
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** Loose email check for list inputs (something@something.tld). */
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/** RSVP email subject: fills {гостин}/{guest} and {настан}/{event}. */
export function fillSubject(template: string, guest: string, eventName: string) {
  return template
    .replace(/\{гостин\}|\{guest\}/g, guest)
    .replace(/\{настан\}|\{event\}/g, eventName);
}

/** A lead's free-text contact as a link: mailto: for emails, tel: otherwise. */
export const contactHref = (contact: string) =>
  contact.includes("@") ? `mailto:${contact}` : `tel:${contact.replace(/[^\d+]/g, "")}`;

/** Moves an item to another index (returns the same list when `to` is out of range). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
