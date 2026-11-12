import type { TemplateDefinition } from "../engine/types";

const L = (mk: string, en: string) => ({ mk, en });

export const minimalWedding: TemplateDefinition = {
  id: "minimal-wedding",
  name: "Modern Minimal Wedding",
  category: "wedding",
  description: "Big type, black & white photography and numbered sections — an editorial, calm wedding page.",
  tagline: "Big type, black & white photography, editorial calm.",
  thumb: { bg: "#FFFFFF", ink: "#111111", font: "Prata, serif", mono: "18·09" },
  fonts: {
    href: "https://fonts.googleapis.com/css2?family=Prata&family=Inter:wght@300;400;500;600&display=swap",
    heading: "Prata",
    body: "Inter",
  },
  sections: [
    { id: "welcome", label: "Invitation text", defaultEnabled: true },
    { id: "countdown", label: "Countdown", defaultEnabled: true },
    { id: "program", label: "Program", defaultEnabled: true },
    { id: "rsvp", label: "RSVP form", defaultEnabled: true },
    { id: "location", label: "Location & map", defaultEnabled: true, required: true },
    { id: "music", label: "Music", defaultEnabled: false },
    { id: "footer", label: "Footer", defaultEnabled: true },
  ],
  photoSlots: [{ id: "hero", label: "Hero (black & white recommended)", aspect: "4:5", required: true }],
  themeOptions: [{ key: "accent", label: "Accent", default: "#B0896B", options: ["#B0896B", "#111111", "#6E7F73", "#A65A5A"] }],
  rsvpMode: "guests-with-menu",
  defaultLanguages: ["mk"],
  defaultContent: {
    names: L("[Невеста] & [Младоженец]", "[Bride] & [Groom]"),
    partnerOne: L("[Невеста]", "[Bride]"),
    partnerTwo: L("[Младоженец]", "[Groom]"),
    eyebrow: L("Свадба", "Wedding"),
    city: L("Скопје", "Skopje"),
    welcome: {
      heading: L("Покана", "Invitation"),
      text: L(
        "Ве покануваме да бидете дел од почетокот на нашата заедничка приказна.",
        "We invite you to be part of the beginning of our story together.",
      ),
    },
    countdown: { heading: L("до големото „Да“", "until the big “Yes”") },
    program: {
      heading: L("Програма", "Program"),
      items: [
        { id: "p1", time: "16:00", title: L("Венчавка", "Ceremony"), place: L("[Црква]", "[Church]") },
        { id: "p2", time: "18:30", title: L("Коктел", "Cocktails"), place: L("Тераса, [Ресторан]", "Terrace, [Restaurant]") },
        { id: "p3", time: "20:00", title: L("Вечера и прва игра", "Dinner & first dance"), place: L("Сала, [Ресторан]", "Hall, [Restaurant]") },
      ],
    },
    rsvp: {
      mode: "guests-with-menu",
      heading: L("Ќе бидете таму?", "Will you be there?"),
      menuOptions: ["Месо", "Риба", "Вегетаријанско"],
      askAllergies: false,
      askMessage: false,
    },
    location: {
      heading: L("Локација", "Location"),
      venues: [{ id: "v1", name: L("[Ресторан]", "[Restaurant]"), address: L("Скопје", "Skopje"), mapsQuery: "" }],
    },
    music: { mediaId: null },
    footer: {},
    photos: {},
  },
  demo: {
    slug: "demo-minimal-wedding",
    name: "Ана & Марко",
    date: "2027-09-18",
    time: "16:00",
    content: {
      names: L("Ана & Марко", "Ana & Marko"),
      partnerOne: L("Ана", "Ana"),
      partnerTwo: L("Марко", "Marko"),
      program: {
        heading: L("Програма", "Program"),
        items: [
          { id: "p1", time: "16:00", title: L("Венчавка", "Ceremony"), place: L("Соборен храм Св. Климент", "St. Clement Cathedral") },
          { id: "p2", time: "18:30", title: L("Коктел", "Cocktails"), place: L("Тераса, Ресторан Панорама", "Terrace, Panorama") },
          { id: "p3", time: "20:00", title: L("Вечера и прва игра", "Dinner & first dance"), place: L("Сала, Ресторан Панорама", "Hall, Panorama") },
        ],
      },
      location: {
        heading: L("Локација", "Location"),
        venues: [{ id: "v1", name: L("Ресторан Панорама", "Panorama Restaurant"), address: L("Скопје", "Skopje"), mapsQuery: "Скопје" }],
      },
    },
    photos: { hero: "1.jpg" },
  },
  strings: {
    mk: {
      submit: "Доаѓам",
      submitDecline: "Не можам",
      chooseMenu: "Избери мени",
      directions: "Насоки →",
      rsvpHeading: "Потврда",
    },
    en: {
      submit: "I'll be there",
      submitDecline: "Can't make it",
      directions: "Directions →",
      rsvpHeading: "RSVP",
    },
  },
};

/** Catalog entries this design renders, in gallery order. */
export const definitions: TemplateDefinition[] = [minimalWedding];
