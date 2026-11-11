import type { TemplateDefinition } from "../engine/types";

const L = (mk: string, en: string) => ({ mk, en });

export const kidsBirthday: TemplateDefinition = {
  id: "kids-birthday",
  name: "Kids Birthday Bash",
  category: "birthday",
  description: "Bright and playful, easy for parents to RSVP — child and adult counts, allergies, a fun timeline.",
  tagline: "Bright and playful, easy for parents to RSVP.",
  thumb: { bg: "#FFD866", ink: "#1F4FA0", font: "Comfortaa, sans-serif", mono: "5!" },
  fonts: {
    href: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@500;700&family=Nunito:wght@400;600;700;800&display=swap",
    heading: "Comfortaa",
    body: "Nunito",
  },
  sections: [
    { id: "welcome", label: "Welcome & when/where", defaultEnabled: true },
    { id: "countdown", label: "Countdown", defaultEnabled: true },
    { id: "program", label: "What awaits", defaultEnabled: true },
    { id: "rsvp", label: "RSVP form", defaultEnabled: true },
    { id: "location", label: "Location & map", defaultEnabled: true, required: true },
    { id: "music", label: "Music", defaultEnabled: false },
    { id: "footer", label: "Footer", defaultEnabled: true },
  ],
  photoSlots: [{ id: "hero", label: "Birthday child", aspect: "1:1", required: true }],
  themeOptions: [
    { key: "sun", label: "Background", default: "#FFD866", options: ["#FFD866", "#FFC2D4", "#BDE7FF", "#C9F0D9"] },
    { key: "pop", label: "Accent", default: "#1F4FA0", options: ["#1F4FA0", "#D9467A", "#2E8A5F"] },
  ],
  rsvpMode: "kids",
  defaultLanguages: ["mk"],
  defaultContent: {
    names: L("[Име]", "[Name]"),
    eyebrow: L("ЖУРКА!", "PARTY!"),
    tagline: L("полни", "turns"),
    age: 5,
    city: L("Скопје", "Skopje"),
    welcome: { text: L("Те чекаме на торта, игри и многу смеа!", "Join us for cake, games and lots of laughs!") },
    countdown: { heading: L("Уште малку!", "Almost there!") },
    program: {
      heading: L("Што не чека", "What awaits"),
      items: [
        { id: "p1", time: "11:00", title: L("Игри и аниматори", "Games & entertainers") },
        { id: "p2", time: "12:00", title: L("Пица и сокови", "Pizza & juice") },
        { id: "p3", time: "13:00", title: L("Торта и свеќички", "Cake & candles") },
      ],
    },
    rsvp: { mode: "kids", heading: L("Доаѓате?", "Are you coming?"), menuOptions: [], askAllergies: true, askMessage: false },
    location: {
      venues: [{ id: "v1", name: L("[Игротека]", "[Play centre]"), address: L("[Адреса], Скопје", "[Address], Skopje"), mapsQuery: "" }],
    },
    music: { mediaId: null },
    footer: { text: L("Се гледаме!", "See you there!"), contact: L("[мама Ивана · 070 123 456]", "[Mum Ivana · 070 123 456]") },
    photos: {},
  },
  demo: {
    slug: "demo-kids-birthday",
    name: "Лука полни 5",
    date: "2027-05-15",
    time: "11:00",
    content: {
      names: L("Лука", "Luka"),
      location: {
        venues: [
          {
            id: "v1",
            name: L("Игротека Балончиња", "Balloons play centre"),
            address: L("Аеродром, Скопје", "Aerodrom, Skopje"),
            mapsQuery: "Аеродром, Скопје",
          },
        ],
      },
      footer: { text: L("Се гледаме!", "See you there!"), contact: L("мама Ивана · 070 123 456", "Mum Ivana · 070 123 456") },
    },
    photos: { hero: "2.jpg" },
  },
  strings: {
    mk: {
      days: "дена",
      hours: "часа",
      minutes: "мин",
      submit: "Доаѓаме!",
      submitDecline: "Испрати",
      notAttending: "Нема да можеме да дојдеме",
      rsvpDeadline: "Јавете ни до {date}",
      directions: "Како да стигнете",
      thanks: "Супер! Ве чекаме! 🎉",
    },
    en: {
      submit: "We're coming!",
      notAttending: "We can't make it",
      rsvpDeadline: "Let us know by {date}",
      directions: "How to get there",
      thanks: "Yay! See you there! 🎉",
    },
  },
};
