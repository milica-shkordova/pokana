import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, attendance } = req.body;
  if (!name || !attendance) return res.status(400).json({ error: "Missing fields" });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const attendanceText = attendance === "yes" ? "Да, доаѓа" : "За жал, не може";

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: "shkordovaa@gmail.com",
    subject: `RSVP: ${name}`,
    text: `Ime: ${name}\nPrisustivo: ${attendanceText}`,
    html: `<p><strong>Ime i prezime:</strong> ${name}</p><p><strong>Prisustvo:</strong> ${attendanceText}</p>`,
  });

  res.status(200).json({ ok: true });
}
