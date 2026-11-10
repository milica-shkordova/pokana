import { env } from "../env";

// Email via Resend's HTTP API (no SDK needed). Without RESEND_API_KEY the
// message is printed to the console instead, so local development works
// end to end without a provider.

export interface MailMessage {
  from: string;
  to: string[];
  cc?: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export class MailError extends Error {}

export async function sendMail(msg: MailMessage): Promise<{ id: string; dev?: boolean }> {
  const to = [...new Set(msg.to.filter(Boolean))];
  const cc = [...new Set((msg.cc ?? []).filter((a) => a && !to.includes(a)))];
  if (to.length === 0 && cc.length === 0) throw new MailError("No recipients");

  if (!env.RESEND_API_KEY) {
    console.log(
      [
        "┌─ ✉  email (dev — set RESEND_API_KEY to really send) ─────────",
        `│ From:    ${msg.from}`,
        `│ To:      ${to.join(", ")}${cc.length ? `\n│ Cc:      ${cc.join(", ")}` : ""}`,
        `│ Subject: ${msg.subject}`,
        "│",
        ...msg.text.split("\n").map((l) => `│ ${l}`),
        "└──────────────────────────────────────────────────────────────",
      ].join("\n"),
    );
    return { id: `dev-${Date.now()}`, dev: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: msg.from,
      to: to.length ? to : cc,
      cc: to.length && cc.length ? cc : undefined,
      reply_to: msg.replyTo,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) throw new MailError(body.message ?? `Resend responded ${res.status}`);
  return { id: body.id ?? "" };
}
