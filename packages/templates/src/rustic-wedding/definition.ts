import type { TemplateDefinition } from "../engine/types";

const L = (mk: string, en: string) => ({ mk, en });

export const rusticWedding: TemplateDefinition = {
  id: "rustic-wedding",
  name: "Rustic Wedding",
  category: "wedding",
  description: "Warm kraft paper, terracotta and olive — arched photo, timeline and a venue card. For garden and vineyard weddings.",
  tagline: "Warm kraft paper, terracotta and olive.",
  thumb: { bg: "#EDE3D3", ink: "#8E4E32", font: "'Cormorant Garamond', serif", mono: "A & M" },
  fonts: {
    href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap",
    heading: "Cormorant Garamond",
    body: "Lora",
  },
  sections: [
    { id: "welcome", label: "Welcome text", defaultEnabled: true },
    { id: "countdown", label: "Countdown", defaultEnabled: true },
    { id: "program", label: "Program", defaultEnabled: true },
    { id: "rsvp", label: "RSVP form", defaultEnabled: true },
    { id: "location", label: "Location", defaultEnabled: true, required: true },
    { id: "music", label: "Music", defaultEnabled: false },
    { id: "footer", label: "Footer", defaultEnabled: true },
  ],
  photoSlots: [
    { id: "hero", label: "Couple (arched)", aspect: "4:5", required: true },
    { id: "nature", label: "Before RSVP (nature)", aspect: "16:9", required: false },
  ],
  themeOptions: [
    { key: "accent", label: "Accent", default: "#8E4E32", options: ["#8E4E32", "#5E6B47", "#9A6B3F"] },
    { key: "paper", label: "Paper", default: "#EDE3D3", options: ["#EDE3D3", "#F4EEE4", "#E6DCCB"] },
  ],
  rsvpMode: "guest-count",
  defaultLanguages: ["mk"],
  defaultContent: {
    names: L("[Невеста] & [Младоженец]", "[Bride] & [Groom]"),
    partnerOne: L("[Невеста]", "[Bride]"),
    partnerTwo: L("[Младоженец]", "[Groom]"),
    eyebrow: L("Се венчаваме", "We're getting married"),
    welcome: {
      text: L(
        "Со радост во срцето ве покануваме да го споделите со нас денот кога ќе ги споиме нашите животи.",
        "With joy in our hearts we invite you to share the day we join our lives together.",
      ),
    },
    countdown: { heading: L("Уште само…", "Only…") },
    program: {
      heading: L("Текот на денот", "The day"),
      items: [
        { id: "p1", time: "16:00", title: L("Црковен обред", "Church ceremony"), place: L("[Црква]", "[Church]") },
        { id: "p2", time: "18:00", title: L("Коктел во градината", "Garden cocktails"), place: L("[Име на имот]", "[Estate name]") },
        { id: "p3", time: "19:30", title: L("Вечера и забава", "Dinner & dancing"), place: L("Под ѕвездите", "Under the stars") },
      ],
    },
    rsvp: { mode: "guest-count", heading: L("Ќе дојдете?", "Will you come?"), menuOptions: [], askAllergies: false, askMessage: false },
    location: {
      venues: [{ id: "v1", name: L("[Име на имот]", "[Estate name]"), address: L("с. [Село], Скопски регион", "[Village], Skopje region"), mapsQuery: "" }],
    },
    music: { mediaId: null },
    footer: {},
    photos: {},
  },
  demo: {
    slug: "demo-rustic-wedding",
    name: "Ана & Марко",
    date: "2027-09-18",
    time: "16:00",
    content: {
      names: L("Ана & Марко", "Ana & Marko"),
      partnerOne: L("Ана", "Ana"),
      partnerTwo: L("Марко", "Marko"),
      program: {
        heading: L("Текот на денот", "The day"),
        items: [
          { id: "p1", time: "16:00", title: L("Црковен обред", "Church ceremony"), place: L("Црква Св. Никола", "St. Nicholas Church") },
          { id: "p2", time: "18:00", title: L("Коктел во градината", "Garden cocktails"), place: L("Имот Дабова Шума", "Oak Grove Estate") },
          { id: "p3", time: "19:30", title: L("Вечера и забава", "Dinner & dancing"), place: L("Под ѕвездите", "Under the stars") },
        ],
      },
      location: {
        venues: [{ id: "v1", name: L("Имот Дабова Шума", "Oak Grove Estate"), address: L("с. Сопиште, Скопски регион", "Sopište, Skopje region"), mapsQuery: "Сопиште" }],
      },
    },
    photos: { hero: "1.jpg", nature: "3.jpg" },
  },
  strings: {
    mk: {
      days: "дена",
      hours: "часа",
      minutes: "мин",
      seconds: "сек",
      attending: "Со радост",
      notAttending: "Не можам",
      submit: "ИСПРАТИ",
      submitDecline: "ИСПРАТИ",
      rsvpDeadline: "Ве молиме потврдете до {date}",
      openInMaps: "Отвори во мапи",
    },
    en: {
      attending: "Joyfully yes",
      notAttending: "Can't make it",
      submit: "SEND",
      submitDecline: "SEND",
    },
  },
};
