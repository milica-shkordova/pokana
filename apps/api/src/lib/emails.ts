import type { Settings } from "@pokanito/shared";
import { env } from "../env";
import type { MailMessage } from "./mailer";

// Email content. Kept deliberately simple: a short HTML body that reads
// well in Gmail/Outlook on a phone, plus a plain-text version.

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, rows: string[], footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#F7F5EF;font-family:Manrope,Segoe UI,Arial,sans-serif;color:#2A2522">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<div style="background:#fff;border:1px solid #E7E2D6;border-radius:14px;padding:24px">
<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:22px;font-weight:600">${esc(title)}</h1>
${rows.map((r) => `<p style="margin:0 0 8px;font-size:15px;line-height:1.6">${r}</p>`).join("\n")}
</div>
<p style="margin:16px 4px 0;font-size:12px;color:#6F675E">${footer}</p>
</div></body></html>`;
}

const from = (s: Settings) => `${s.senderName} <${s.fromAddress}>`;

export function fillSubject(template: string, guest: string, eventName: string) {
  return template
    .replace(/\{гостин\}|\{guest\}/g, guest)
    .replace(/\{настан\}|\{event\}/g, eventName);
}

export interface RsvpEmailData {
  eventName: string;
  locale: "mk" | "en";
  name: string;
  attending: boolean;
  totalGuests: number;
  guests: { name: string; menu?: string }[];
  adults?: number | null;
  children?: number | null;
  allergies?: string | null;
  message?: string | null;
  extra?: { company?: string; email?: string; dinner?: boolean; plusOne?: boolean };
}

const RSVP_LABELS = {
  mk: {
    attending: "Доаѓа",
    yes: "Да",
    no: "Не",
    guests: "Гости",
    menu: "Мени",
    adults: "Возрасни",
    children: "Деца",
    allergies: "Алергии",
    message: "Порака",
    company: "Компанија",
    email: "E-mail",
    dinner: "Вечера",
    plusOne: "Плус еден",
    footer: "Пратено од Pokanito · одговорите ги чуваме и во админ панелот.",
    test: "ТЕСТ — ова е пробна потврда за да провериме дека пораките пристигнуваат.",
  },
  en: {
    attending: "Attending",
    yes: "Yes",
    no: "No",
    guests: "Guests",
    menu: "Menu",
    adults: "Adults",
    children: "Children",
    allergies: "Allergies",
    message: "Message",
    company: "Company",
    email: "Email",
    dinner: "Dinner",
    plusOne: "Plus one",
    footer: "Sent by Pokanito · replies are also kept in the admin panel.",
    test: "TEST — this is a sample reply to check that emails arrive.",
  },
};

/** One RSVP → one email, like the preview in Settings › RSVP emails. */
export function rsvpEmail(settings: Settings, to: string[], cc: string[], d: RsvpEmailData, test = false): MailMessage {
  const L = RSVP_LABELS[d.locale];
  const subject = (test ? "[TEST] " : "") + fillSubject(settings.subjectTemplate, d.name, d.eventName);
  const menus = d.guests.map((g) => g.menu).filter(Boolean);
  const lines: [string, string][] = [[L.attending, d.attending ? L.yes : L.no]];
  if (d.attending) lines.push([L.guests, String(d.totalGuests)]);
  if (d.attending && d.guests.length > 1) lines.push([L.guests, d.guests.map((g) => g.name).join(", ")]);
  if (menus.length) lines.push([L.menu, menus.join(", ")]);
  if (d.adults != null) lines.push([L.adults, String(d.adults)]);
  if (d.children != null) lines.push([L.children, String(d.children)]);
  if (d.extra?.plusOne !== undefined) lines.push([L.plusOne, d.extra.plusOne ? L.yes : L.no]);
  if (d.extra?.company) lines.push([L.company, d.extra.company]);
  if (d.extra?.email) lines.push([L.email, d.extra.email]);
  if (d.extra?.dinner !== undefined) lines.push([L.dinner, d.extra.dinner ? L.yes : L.no]);
  if (d.allergies) lines.push([L.allergies, d.allergies]);

  const title = fillSubject(settings.subjectTemplate, d.name, d.eventName);
  const htmlRows = [
    ...(test ? [`<span style="color:#7A4E15;font-weight:700">${esc(L.test)}</span>`] : []),
    lines.map(([k, v]) => `${esc(k)}: <b>${esc(v)}</b>`).join(" · "),
    ...(d.message ? [`<span style="color:#6F675E">${esc(L.message)}: „${esc(d.message)}“</span>`] : []),
  ];
  const text = [
    ...(test ? [L.test, ""] : []),
    title,
    "",
    ...lines.map(([k, v]) => `${k}: ${v}`),
    ...(d.message ? ["", `${L.message}: „${d.message}“`] : []),
  ].join("\n");

  return { from: from(settings), to, cc, subject, html: layout(title, htmlRows, esc(L.footer)), text };
}

export const sampleRsvp = (eventName: string, locale: "mk" | "en", menus: string[]): RsvpEmailData => ({
  eventName,
  locale,
  name: locale === "mk" ? "Јована Петрова" : "Jovana Petrova",
  attending: true,
  totalGuests: 2,
  guests: [
    { name: locale === "mk" ? "Јована Петрова" : "Jovana Petrova", menu: menus[0] },
    { name: locale === "mk" ? "Марко Петров" : "Marko Petrov", menu: menus[1] ?? menus[0] },
  ],
  message: locale === "mk" ? "Едвај чекаме!" : "Can't wait!",
});

export function digestEmail(
  settings: Settings,
  to: string[],
  eventName: string,
  locale: "mk" | "en",
  rows: RsvpEmailData[],
  totals: { responses: number; attendingGuests: number; declined: number },
): MailMessage {
  const mk = locale === "mk";
  const title = mk ? `Дневен преглед: ${eventName}` : `Daily summary: ${eventName}`;
  const head = mk
    ? `Нови одговори денес: <b>${rows.length}</b> · Вкупно доаѓаат: <b>${totals.attendingGuests}</b> · Не доаѓаат: <b>${totals.declined}</b>`
    : `New replies today: <b>${rows.length}</b> · Total attending: <b>${totals.attendingGuests}</b> · Declined: <b>${totals.declined}</b>`;
  const items = rows.map(
    (r) =>
      `• <b>${esc(r.name)}</b> — ${r.attending ? `${mk ? "доаѓа" : "attending"} (${r.totalGuests})` : mk ? "не доаѓа" : "declined"}${
        r.guests.some((g) => g.menu) ? ` · ${esc(r.guests.map((g) => g.menu).filter(Boolean).join(", "))}` : ""
      }`,
  );
  const text = [title, "", head.replace(/<[^>]+>/g, ""), "", ...items.map((i) => i.replace(/<[^>]+>/g, ""))].join("\n");
  return { from: from(settings), to, subject: title, html: layout(title, [head, ...items], "Pokanito"), text };
}

export function leadEmail(settings: Settings, lead: { name: string; contact: string; source: string; template?: string | null; eventDate?: string | null; guestCount?: number | null; message: string }): MailMessage {
  const notify = lead.source === "notify-me";
  const title = notify ? `Notify me: ${lead.name} — ${lead.template ?? ""}` : `New lead: ${lead.name}${lead.template ? ` — ${lead.template}` : ""}`;
  const rows: [string, string][] = [
    ["Contact", lead.contact],
    ["Template", lead.template ?? "—"],
    ...(lead.eventDate ? ([["Event date", lead.eventDate]] as [string, string][]) : []),
    ...(lead.guestCount ? ([["Guests", String(lead.guestCount)]] as [string, string][]) : []),
  ];
  const html = layout(
    title,
    [
      ...rows.map(([k, v]) => `${esc(k)}: <b>${esc(v)}</b>`),
      ...(lead.message ? [esc(lead.message).replace(/\n/g, "<br>")] : []),
      `<a href="${env.ADMIN_URL}/leads" style="color:#2A2522">Open in the admin →</a>`,
    ],
    "Pokanito",
  );
  const text = [title, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", lead.message, "", `${env.ADMIN_URL}/leads`].join("\n");
  const replyTo = lead.contact.includes("@") ? lead.contact : undefined;
  return { from: from(settings), to: [settings.contactEmail], replyTo, subject: title, html, text };
}

export function inviteEmail(settings: Settings, to: string, inviter: string, link: string): MailMessage {
  const title = `${inviter} invited you to the ${settings.businessName} admin`;
  return {
    from: from(settings),
    to: [to],
    subject: title,
    html: layout(
      title,
      [
        "Use the link below to choose your name and password. It expires in 7 days.",
        `<a href="${link}" style="display:inline-block;margin-top:8px;padding:12px 20px;border-radius:999px;background:#231F1E;color:#fff;text-decoration:none;font-weight:600">Accept invite</a>`,
      ],
      esc(link),
    ),
    text: `${title}\n\nAccept the invite (expires in 7 days):\n${link}`,
  };
}
