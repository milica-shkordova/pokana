import type { TemplateDefinition } from "../engine/types";

const L = (mk: string, en: string) => ({ mk, en });

export const milestoneBirthday: TemplateDefinition = {
  id: "milestone-birthday",
  name: "Milestone Birthday",
  category: "birthday",
  description: "Black and gold for the big 30, 40, 50 — a huge age numeral, then-and-now photos, dress code and plus-one RSVP.",
  tagline: "Black and gold for the big 30, 40, 50.",
  thumb: { bg: "#16171D", ink: "#D9B86C", font: "'Playfair Display', serif", mono: "30" },
  fonts: {
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600&display=swap",
    heading: "Playfair Display",
    body: "Manrope",
  },
  sections: [
    { id: "welcome", label: "Welcome text", defaultEnabled: true },
    { id: "countdown", label: "Countdown", defaultEnabled: true },
    { id: "info", label: "Dress code & evening", defaultEnabled: true },
    { id: "rsvp", label: "RSVP form", defaultEnabled: true },
    { id: "location", label: "Location", defaultEnabled: true, required: true },
    { id: "music", label: "Music", defaultEnabled: false },
    { id: "footer", label: "Footer", defaultEnabled: true },
  ],
  photoSlots: [
    { id: "then", label: "Then", aspect: "165:230", required: true },
    { id: "now", label: "Now", aspect: "165:230", required: true },
  ],
  themeOptions: [{ key: "gold", label: "Gold", default: "#D9B86C", options: ["#D9B86C", "#C9C9D1", "#E0A9A0"] }],
  rsvpMode: "plus-one",
  defaultLanguages: ["mk"],
  defaultContent: {
    names: L("[Име]", "[Name]"),
    eyebrow: L("Ве покануваме на прослава", "You're invited to celebrate"),
    age: 30,
    city: L("Скопје", "Skopje"),
    welcome: {
      text: L(
        "Три децении, многу приказни и една ноќ за славење. Би сакала да бидеш таму.",
        "Three decades, many stories and one night to celebrate. I'd love for you to be there.",
      ),
    },
    countdown: { heading: L("ОДБРОЈУВАЊЕ", "COUNTDOWN") },
    info: {
      items: [
        { id: "i1", label: L("DRESS CODE", "DRESS CODE"), title: L("Black & Gold", "Black & Gold"), text: L("Елегантно, со малку сјај.", "Elegant, with a little sparkle.") },
        { id: "i2", label: L("ВЕЧЕРТА", "THE EVENING"), title: L("21:00 → доцна", "21:00 → late"), text: L("Коктели, вечера, DJ.", "Cocktails, dinner, DJ.") },
      ],
    },
    rsvp: { mode: "plus-one", heading: L("Доаѓаш?", "Are you coming?"), menuOptions: [], askAllergies: false, askMessage: false },
    location: {
      heading: L("КАДЕ", "WHERE"),
      venues: [{ id: "v1", name: L("[Име на бар / сала]", "[Bar / venue name]"), address: L("[Адреса], Скопје", "[Address], Skopje"), mapsQuery: "" }],
    },
    music: { mediaId: null },
    footer: { text: L("Се гледаме!", "See you there!") },
    photos: {},
  },
  demo: {
    slug: "demo-milestone-birthday",
    name: "Елена 30",
    date: "2027-02-06",
    time: "21:00",
    content: {
      names: L("Елена", "Elena"),
      location: {
        heading: L("КАДЕ", "WHERE"),
        venues: [{ id: "v1", name: L("Бар Ноар", "Bar Noir"), address: L("Старата чаршија, Скопје", "Old Bazaar, Skopje"), mapsQuery: "Старата чаршија, Скопје" }],
      },
    },
    photos: { then: "2.jpg", now: "3.jpg" },
  },
  strings: {
    mk: {
      days: "дена",
      hours: "часа",
      minutes: "мин",
      seconds: "сек",
      name: "Твоето име",
      plusOne: "Плус еден?",
      justMe: "Само јас",
      meAndOne: "Јас + 1",
      submit: "ПОТВРДИ",
      notAttending: "Нажалост, не можам",
      rsvpDeadline: "Јави ми до {date}",
      openInMaps: "ОТВОРИ МАПА",
      thanks: "Супер! Се гледаме.",
    },
    en: {
      name: "Your name",
      submit: "CONFIRM",
      notAttending: "Sadly, I can't make it",
      rsvpDeadline: "Let me know by {date}",
      openInMaps: "OPEN MAP",
      thanks: "Great! See you there.",
    },
  },
};

/** Catalog entries this design renders, in gallery order. */
export const definitions: TemplateDefinition[] = [milestoneBirthday];
