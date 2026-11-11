import type { EventContent } from "@momentelo/shared";
import type { TemplateDefinition } from "../engine/types";

// Classic Christening and Floral Baptism share one component
// (FloralChristening.dc.html); Classic defaults to the blue palette.

const L = (mk: string, en: string) => ({ mk, en });

const base = {
  category: "christening" as const,
  fonts: {
    href: "https://fonts.googleapis.com/css2?family=Cormorant+Infant:ital,wght@0,500;0,600;1,500&family=Nunito+Sans:wght@300;400;600&display=swap",
    heading: "Cormorant Infant",
    body: "Nunito Sans",
  },
  sections: [
    { id: "welcome", label: "Welcome text", defaultEnabled: true },
    { id: "godparents", label: "Godparents (кумови)", defaultEnabled: true },
    { id: "countdown", label: "Countdown", defaultEnabled: true },
    { id: "program", label: "Program", defaultEnabled: true },
    { id: "rsvp", label: "RSVP form", defaultEnabled: true },
    { id: "location", label: "Location & map", defaultEnabled: true, required: true },
    { id: "music", label: "Music", defaultEnabled: false },
    { id: "footer", label: "Footer", defaultEnabled: true },
  ] satisfies TemplateDefinition["sections"],
  photoSlots: [{ id: "hero", label: "Baby photo (oval)", aspect: "13:17", required: true }],
  rsvpMode: "guest-count" as const,
  defaultLanguages: ["mk" as const],
  strings: {
    mk: {
      days: "дена",
      hours: "часа",
      minutes: "мин",
      submit: "Ќе дојдеме",
      submitDecline: "Не можеме",
      rsvpDeadline: "до {date}",
      thanks: "Благодариме! Ве очекуваме.",
      thanksDecline: "Благодариме што нè известивте.",
    },
    en: {
      submit: "We'll be there",
      submitDecline: "Can't make it",
      rsvpDeadline: "by {date}",
    },
  },
};

const content = (overrides: Partial<EventContent> = {}): EventContent => ({
  names: L("[Име]", "[Name]"),
  eyebrow: L("СВЕТО КРШТЕВАЊЕ", "HOLY BAPTISM"),
  organizer: L("[Родители]", "[Parents]"),
  welcome: {
    text: L(
      "Со голема радост ве покануваме да ја споделите со нас благословената тајна на крштевањето на нашата ќерка.",
      "With great joy we invite you to share with us the blessed sacrament of our daughter's baptism.",
    ),
  },
  godparents: { heading: L("КУМОВИ", "GODPARENTS"), names: L("[Кумови]", "[Godparents]") },
  countdown: { heading: L("До празникот остануваат", "Until the celebration") },
  program: {
    heading: L("Програма", "Program"),
    items: [
      { id: "p1", time: "11:00", title: L("Крштевање", "Baptism"), place: L("[Црква]", "[Church]") },
      { id: "p2", time: "13:30", title: L("Ручек", "Lunch"), place: L("Ресторан [Име]", "[Restaurant]") },
    ],
  },
  rsvp: { mode: "guest-count", heading: L("Потврдете присуство", "Please RSVP"), menuOptions: [], askAllergies: false, askMessage: false },
  location: {
    venues: [
      { id: "v1", label: L("До црквата", "To the church"), name: L("[Црква]", "[Church]"), address: L("[Адреса], Скопје", "[Address], Skopje"), mapsQuery: "" },
      { id: "v2", label: L("До ресторанот", "To the restaurant"), name: L("[Ресторан]", "[Restaurant]"), address: L("[Адреса], Скопје", "[Address], Skopje"), mapsQuery: "" },
    ],
  },
  music: { mediaId: null },
  footer: {},
  photos: {},
  ...overrides,
});

const demoContent: Partial<EventContent> = {
  names: L("Мила", "Mila"),
  organizer: L("Петар и Марија Илиеви", "Petar & Marija Ilievi"),
  godparents: { heading: L("КУМОВИ", "GODPARENTS"), names: L("Стефан & Ана Трајкови", "Stefan & Ana Trajkovi") },
  program: {
    heading: L("Програма", "Program"),
    items: [
      { id: "p1", time: "11:00", title: L("Крштевање", "Baptism"), place: L("Црква Св. Пантелејмон", "St. Panteleimon Church") },
      { id: "p2", time: "13:30", title: L("Ручек", "Lunch"), place: L("Ресторан Липа", "Lipa Restaurant") },
    ],
  },
  location: {
    venues: [
      { id: "v1", label: L("До црквата", "To the church"), name: L("Црква Св. Пантелејмон", "St. Panteleimon Church"), address: L("Горно Нерези, Скопје", "Gorno Nerezi, Skopje"), mapsQuery: "Св. Пантелејмон, Горно Нерези" },
      { id: "v2", label: L("До ресторанот", "To the restaurant"), name: L("Ресторан Липа", "Lipa Restaurant"), address: L("Скопје", "Skopje"), mapsQuery: "Скопје" },
    ],
  },
};

export const classicChristening: TemplateDefinition = {
  ...base,
  id: "classic-christening",
  name: "Classic Christening",
  description: "Soft and timeless, for baptisms and naming days — oval photo, godparents, program and RSVP.",
  tagline: "Soft and timeless, for baptisms and naming days.",
  thumb: { bg: "#EAF0F4", ink: "#4C6A85", font: "'Cormorant Infant', serif", mono: "Мила" },
  themeOptions: [
    { key: "blush", label: "Paper", default: "#EAF0F4", options: ["#EAF0F4", "#F6ECEA", "#F3F1E7"] },
    { key: "petal", label: "Flowers", default: "#8FB0C9", options: ["#8FB0C9", "#D99A9A", "#E3C17A"] },
    { key: "ink", label: "Ink", default: "#4C6A85", options: ["#4C6A85", "#4F6658", "#6B5A7A"] },
  ],
  defaultContent: content(),
  demo: { slug: "demo-classic-christening", name: "Крштевање на Мила", date: "2027-01-09", time: "11:00", content: demoContent, photos: { hero: "slika.jpeg" } },
};

export const floralChristening: TemplateDefinition = {
  ...base,
  id: "floral-christening",
  name: "Floral Baptism",
  description: "Blush and sage with hand-drawn florals, an oval photo, godparents and RSVP.",
  tagline: "Blush and sage with hand-drawn florals.",
  thumb: { bg: "#F6ECEA", ink: "#6E8576", font: "'Cormorant Infant', serif", mono: "Мила" },
  themeOptions: [
    { key: "blush", label: "Paper", default: "#F6ECEA", options: ["#F6ECEA", "#EAF0F4", "#F3F1E7"] },
    { key: "petal", label: "Flowers", default: "#D99A9A", options: ["#D99A9A", "#8FB0C9", "#E3C17A"] },
    { key: "ink", label: "Ink", default: "#4F6658", options: ["#4F6658", "#4C6A85", "#6B5A7A"] },
  ],
  defaultContent: content(),
  demo: { slug: "demo-floral-christening", name: "Крштевање на Мила", date: "2027-01-09", time: "11:00", content: demoContent, photos: { hero: "slika.jpeg" } },
};
