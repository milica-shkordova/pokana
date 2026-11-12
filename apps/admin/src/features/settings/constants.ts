export const SECTIONS = [
  { id: "business", label: "Business profile" },
  { id: "rsvp", label: "RSVP emails" },
  { id: "links", label: "Links & publishing" },
  { id: "defaults", label: "Invitation defaults" },
  { id: "team", label: "Team" },
  { id: "account", label: "Your account" },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);

/** "Keep online after the event" choices, in months (0 = forever is listed separately). */
export const KEEP_ONLINE_MONTHS = [3, 6, 12];

/** Usual RSVP deadline choices, in days before the event. */
export const RSVP_DEADLINE_DAYS = [7, 14, 21, 30];

/** Sample guest/event shown in the RSVP email preview. */
export const PREVIEW_GUEST = "Јована Петрова";
export const PREVIEW_EVENT = "Ана & Марко";
