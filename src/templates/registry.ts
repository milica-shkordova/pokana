import { TemplateId } from "./types";

export interface TemplateMeta {
  id: string;
  // The actual implemented template this renders, if any is built yet.
  templateId?: TemplateId;
  name: string;
  eventType: string;
  description: string;
  previewImage?: string;
  status: "available" | "coming-soon";
  demoSlug?: string;
}

export const templateRegistry: TemplateMeta[] = [
  // Wedding
  {
    id: "wedding-elegant",
    templateId: "wedding",
    name: "Elegant Wedding",
    eventType: "Wedding",
    description:
      "A scroll-animated wedding invitation with countdown, program timeline, RSVP form and map — the template your guests actually enjoy opening.",
    previewImage: "/assets/1.jpg",
    status: "available",
    demoSlug: "demo-wedding",
  },
  {
    id: "wedding-rustic",
    name: "Rustic Wedding",
    eventType: "Wedding",
    description:
      "A warm, natural-toned invitation with hand-lettered touches — built for barn, garden and vineyard weddings.",
    status: "coming-soon",
  },
  {
    id: "wedding-modern",
    name: "Modern Minimal Wedding",
    eventType: "Wedding",
    description:
      "A clean, editorial layout for couples who want their invitation to feel like a design magazine spread.",
    status: "coming-soon",
  },

  // Birthday
  {
    id: "birthday-kids",
    name: "Kids Birthday Bash",
    eventType: "Birthday",
    description:
      "Bright, playful and easy to scan for parents on the go — built for milestone kids' parties.",
    status: "coming-soon",
  },
  {
    id: "birthday-milestone",
    name: "Milestone Birthday",
    eventType: "Birthday",
    description:
      "An elegant invitation for 30th, 40th, 50th and other big-number birthdays.",
    status: "coming-soon",
  },
  {
    id: "birthday-garden",
    name: "Garden Party Birthday",
    eventType: "Birthday",
    description: "A soft, botanical design for outdoor birthday celebrations.",
    status: "coming-soon",
  },

  // Corporate
  {
    id: "corporate-conference",
    name: "Conference & Summit",
    eventType: "Corporate",
    description:
      "A polished, agenda-first layout for multi-day conferences and summits.",
    status: "coming-soon",
  },
  {
    id: "corporate-launch",
    name: "Product Launch",
    eventType: "Corporate",
    description:
      "A bold, brand-forward invitation for product reveals and launch events.",
    status: "coming-soon",
  },
  {
    id: "corporate-gala",
    name: "Company Gala",
    eventType: "Corporate",
    description:
      "A refined invitation for galas, anniversaries and company celebrations.",
    status: "coming-soon",
  },

  // Christening
  {
    id: "christening-classic",
    name: "Classic Christening",
    eventType: "Christening",
    description:
      "A timeless, soft-toned invitation for christenings and naming ceremonies.",
    status: "coming-soon",
  },
  {
    id: "christening-floral",
    name: "Floral Baptism",
    eventType: "Christening",
    description: "A delicate, floral-accented invitation for baptisms.",
    status: "coming-soon",
  },
  {
    id: "christening-modern",
    name: "Modern Naming Day",
    eventType: "Christening",
    description:
      "A simple, contemporary layout for modern naming day celebrations.",
    status: "coming-soon",
  },
];

// eventType -> a placeholder icon shown on cards without a preview image.
export const eventTypeIcons: Record<string, string> = {
  Wedding: "✦",
  Birthday: "🎂",
  Corporate: "💼",
  Christening: "🕊",
};
