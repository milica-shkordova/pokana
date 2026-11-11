import { findPlaceholders, isBlank, type ChecklistItem, type EventContent, type Locale, type SectionState } from "@momentelo/shared";
import { resolveSections, type TemplateDefinition } from "./types";

export interface ChecklistInput {
  name: string;
  eventDate: string | null;
  languages: Locale[];
  content: EventContent;
  sections: SectionState[];
  rsvpEmails: string[];
  rsvpTestedAt: string | null;
  rsvpDeadline: string | null;
  clientApproved: boolean;
}

/** "Ready to publish?" — publishing is blocked until every item is ok. */
export function getPublishChecklist(event: ChecklistInput, def: TemplateDefinition): ChecklistItem[] {
  const sections = resolveSections(def, event.sections);
  const rsvpOn = sections.some((s) => s.id === "rsvp" && s.enabled);

  const namesOk = event.languages.every((l) => !isBlank(event.content.names, l));
  const requiredSlots = def.photoSlots.filter((s) => s.required);
  const filled = def.photoSlots.filter((s) => event.content.photos?.[s.id]).length;
  const missing = requiredSlots.filter((s) => !event.content.photos?.[s.id]).length;
  const placeholders = findPlaceholders({ name: event.name, content: event.content });

  return [
    {
      id: "basics",
      ok: namesOk && !!event.eventDate,
      label: namesOk && event.eventDate ? "Names, date & time" : "Add names, date & time",
    },
    {
      id: "photos",
      ok: missing === 0,
      label: missing === 0 ? `${filled} photo${filled === 1 ? "" : "s"} uploaded` : `${missing} photo slot${missing === 1 ? "" : "s"} empty`,
    },
    {
      id: "rsvp-deadline",
      ok: !rsvpOn || !!event.rsvpDeadline,
      label: !rsvpOn ? "RSVP off" : event.rsvpDeadline ? "RSVP deadline set" : "Set an RSVP deadline",
    },
    {
      id: "rsvp-email",
      ok: !rsvpOn || (event.rsvpEmails.length > 0 && !!event.rsvpTestedAt),
      label: !rsvpOn
        ? "No RSVP emails needed"
        : event.rsvpEmails.length === 0
          ? "Add an RSVP email"
          : event.rsvpTestedAt
            ? "RSVP email set & tested"
            : "Send a test RSVP email",
    },
    {
      id: "placeholders",
      ok: placeholders.length === 0,
      label: placeholders.length === 0 ? "No placeholder text" : `${placeholders[0].text} is still a placeholder`,
    },
    {
      id: "approved",
      ok: event.clientApproved,
      label: event.clientApproved ? "Client approved" : "Client hasn't approved yet",
    },
  ];
}
