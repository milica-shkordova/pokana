import { formatDate, LEAD_PIPELINE, type Lead, type LeadStage } from "@pokanito/shared";

/** Where "Move to next stage" goes: the next pipeline step, or back to "new" from lost. */
export function nextStage(lead: Lead | undefined): LeadStage | undefined {
  const stageIdx = lead ? LEAD_PIPELINE.indexOf(lead.stage) : -1;
  return lead && stageIdx >= 0 ? LEAD_PIPELINE[stageIdx + 1] : lead?.stage === "lost" ? "new" : undefined;
}

/** One-line subject for the lead list. */
export const leadSubject = (l: Lead) =>
  l.source === "notify-me" ? `Notify me: ${l.templateName ?? "a template"}` : l.message.split("\n")[0].slice(0, 80) || "(no message)";

/** The lead's event date as typed (free text) or formatted when it parses. */
export const leadEventDate = (l: Lead) =>
  l.eventDate ? (Number.isNaN(Date.parse(l.eventDate)) ? l.eventDate : formatDate(new Date(l.eventDate).toISOString())) : "—";
