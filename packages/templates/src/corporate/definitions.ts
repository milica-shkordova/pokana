import type { TemplateDefinition } from "../engine/types";

// Two catalog entries share one component (CorporateLaunch.dc.html): they
// differ only in default copy.

const L = (en: string, mk: string) => ({ en, mk });

const base = {
  category: "corporate" as const,
  thumb: { bg: "#0F1720", ink: "#7CE3BF", font: "Unbounded, sans-serif", mono: "2027" },
  fonts: {
    href: "https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700&family=Inter:wght@400;500;600&display=swap",
    heading: "Unbounded",
    body: "Inter",
  },
  sections: [
    { id: "countdown", label: "Countdown", defaultEnabled: true },
    { id: "program", label: "Agenda", defaultEnabled: true },
    { id: "people", label: "Speakers", defaultEnabled: true },
    { id: "rsvp", label: "Registration", defaultEnabled: true },
    { id: "location", label: "Venue", defaultEnabled: true, required: true },
    { id: "music", label: "Music", defaultEnabled: false },
    { id: "footer", label: "Footer", defaultEnabled: true },
  ] satisfies TemplateDefinition["sections"],
  photoSlots: [{ id: "visual", label: "Product visual / keynote photo", aspect: "16:10", required: true }],
  themeOptions: [{ key: "accent", label: "Accent", default: "#7CE3BF", options: ["#7CE3BF", "#8FB8FF", "#FFB86B", "#F28FB3"] }],
  rsvpMode: "registration" as const,
  defaultLanguages: ["en" as const],
  strings: {
    en: {
      submit: "Save my seat →",
      submitDecline: "Send",
      notAttending: "I can't attend",
      rsvpHeading: "Register",
      rsvpDeadline: "Register by {date}.",
      directions: "Get directions →",
      thanks: "You're registered — see you there!",
      thanksDecline: "Thanks for letting us know.",
      rsvpClosed: "Registration is closed.",
    },
    mk: {
      submit: "Резервирај место →",
      notAttending: "Не можам да присуствувам",
      rsvpHeading: "Пријава",
      rsvpDeadline: "Пријавете се до {date}.",
      directions: "Насоки →",
      thanks: "Пријавени сте — се гледаме!",
      rsvpClosed: "Пријавите се затворени.",
    },
  },
};

const commonContent = {
  organizer: L("[COMPANY]", "[КОМПАНИЈА]"),
  city: L("Skopje", "Скопје"),
  rsvp: {
    mode: "registration" as const,
    heading: L("Register", "Пријава"),
    note: L("Seats are limited.", "Местата се ограничени."),
    menuOptions: [],
    askAllergies: false,
    askMessage: false,
  },
  location: {
    heading: L("Venue", "Локација"),
    venues: [
      {
        id: "v1",
        name: L("[Venue]", "[Локација]"),
        address: L("[Address], Skopje", "[Адреса], Скопје"),
        mapsQuery: "",
        note: L("Free parking for registered guests", "Бесплатен паркинг за пријавените гости"),
      },
    ],
  },
  music: { mediaId: null },
  footer: { contact: L("events@[company].com", "events@[company].com") },
  photos: {},
};

export const productLaunch: TemplateDefinition = {
  ...base,
  id: "product-launch",
  name: "Product Launch",
  description: "A bold, dark launch page: big headline, countdown, agenda, speakers and registration.",
  tagline: "A bold, dark launch page with countdown and registration.",
  defaultContent: {
    ...commonContent,
    eyebrow: L("PRODUCT LAUNCH · 2027", "ЛАНСИРАЊЕ · 2027"),
    names: L("Meet\nNova.", "Запознајте ја\nNova."),
    tagline: L(
      "Join us for the first look at our new platform, live demos and an evening with the team that built it.",
      "Придружете ни се на првиот поглед кон нашата нова платформа, демо-презентации во живо и вечер со тимот што ја создаде.",
    ),
    countdown: {},
    program: {
      heading: L("Agenda", "Агенда"),
      items: [
        { id: "a1", time: "17:00", title: L("Doors open & welcome drinks", "Отворање и пијалок добредојде") },
        { id: "a2", time: "17:45", title: L("Keynote: Introducing Nova", "Главно предавање: Ја претставуваме Nova"), note: L("[Speaker name], CEO", "[Име на говорник], CEO") },
        { id: "a3", time: "18:30", title: L("Live demo stations", "Демо-станици во живо") },
        { id: "a4", time: "19:30", title: L("Networking dinner", "Вечера и дружење") },
      ],
    },
    people: {
      heading: L("Speakers", "Говорници"),
      items: [
        { id: "s1", name: L("[Name]", "[Име]"), role: L("CEO", "CEO") },
        { id: "s2", name: L("[Name]", "[Име]"), role: L("CTO", "CTO") },
        { id: "s3", name: L("[Name]", "[Име]"), role: L("Head of Product", "Head of Product") },
      ],
    },
  },
  demo: {
    slug: "demo-product-launch",
    name: "Nova launch",
    date: "2027-03-22",
    time: "17:00",
    content: {
      organizer: L("Lumen Labs", "Lumen Labs"),
      program: {
        heading: L("Agenda", "Агенда"),
        items: [
          { id: "a1", time: "17:00", title: L("Doors open & welcome drinks", "Отворање и пијалок добредојде") },
          { id: "a2", time: "17:45", title: L("Keynote: Introducing Nova", "Главно предавање: Ја претставуваме Nova"), note: L("Elena Stojanova, CEO", "Елена Стојанова, CEO") },
          { id: "a3", time: "18:30", title: L("Live demo stations", "Демо-станици во живо") },
          { id: "a4", time: "19:30", title: L("Networking dinner", "Вечера и дружење") },
        ],
      },
      people: {
        heading: L("Speakers", "Говорници"),
        items: [
          { id: "s1", name: L("Elena Stojanova", "Елена Стојанова"), role: L("CEO", "CEO"), photo: "1.jpg" },
          { id: "s2", name: L("Marko Petrov", "Марко Петров"), role: L("CTO", "CTO"), photo: "2.jpg" },
          { id: "s3", name: L("Ana Ilieva", "Ана Илиева"), role: L("Head of Product", "Head of Product"), photo: "3.jpg" },
        ],
      },
      location: {
        heading: L("Venue", "Локација"),
        venues: [
          {
            id: "v1",
            name: L("Lumen Hall", "Lumen Hall"),
            address: L("Boulevard Ilinden 1, Skopje", "Бул. Илинден 1, Скопје"),
            mapsQuery: "Skopje, North Macedonia",
            note: L("Free parking for registered guests", "Бесплатен паркинг за пријавените гости"),
          },
        ],
      },
      footer: { contact: L("events@lumenlabs.example", "events@lumenlabs.example") },
    },
    photos: { visual: "3.jpg" },
  },
};

export const conferenceSummit: TemplateDefinition = {
  ...base,
  id: "conference-summit",
  name: "Conference & Summit",
  description: "An agenda-first page for conferences and summits: agenda, speakers, registration and venue in one link.",
  tagline: "Agenda, speakers and registration in one link.",
  defaultContent: {
    ...commonContent,
    eyebrow: L("ANNUAL SUMMIT · 2027", "ГОДИШЕН САМИТ · 2027"),
    names: L("[Summit]\n2027.", "[Самит]\n2027."),
    tagline: L(
      "A one-day gathering for product, design and engineering leaders: talks, workshops and conversation about what's next.",
      "Еднодневна средба за лидери во продукт, дизајн и инженерство: предавања, работилници и разговори за она што доаѓа.",
    ),
    countdown: {},
    program: {
      heading: L("Agenda", "Агенда"),
      items: [
        { id: "a1", time: "09:00", title: L("Registration & coffee", "Регистрација и кафе") },
        { id: "a2", time: "09:30", title: L("Opening keynote", "Воведно предавање"), note: L("[Speaker name], CEO", "[Име на говорник], CEO") },
        { id: "a3", time: "11:00", title: L("Panel: Building for scale", "Панел: Градење за раст") },
        { id: "a4", time: "13:00", title: L("Lunch", "Ручек") },
        { id: "a5", time: "14:00", title: L("Workshops", "Работилници") },
        { id: "a6", time: "17:00", title: L("Closing reception", "Завршен коктел") },
      ],
    },
    people: {
      heading: L("Speakers", "Говорници"),
      items: [
        { id: "s1", name: L("[Name]", "[Име]"), role: L("[Role, Company]", "[Улога, компанија]") },
        { id: "s2", name: L("[Name]", "[Име]"), role: L("[Role, Company]", "[Улога, компанија]") },
        { id: "s3", name: L("[Name]", "[Име]"), role: L("[Role, Company]", "[Улога, компанија]") },
      ],
    },
  },
  demo: {
    slug: "demo-conference-summit",
    name: "Horizon Summit 2027",
    date: "2027-03-12",
    time: "09:00",
    content: {
      organizer: L("Horizon", "Horizon"),
      names: L("Horizon\nSummit.", "Horizon\nSummit."),
      program: {
        heading: L("Agenda", "Агенда"),
        items: [
          { id: "a1", time: "09:00", title: L("Registration & coffee", "Регистрација и кафе") },
          { id: "a2", time: "09:30", title: L("Opening keynote", "Воведно предавање"), note: L("Jane Doe, CEO", "Џејн До, CEO") },
          { id: "a3", time: "11:00", title: L("Panel: Building for scale", "Панел: Градење за раст") },
          { id: "a4", time: "13:00", title: L("Lunch", "Ручек") },
          { id: "a5", time: "14:00", title: L("Workshops", "Работилници") },
          { id: "a6", time: "17:00", title: L("Closing reception", "Завршен коктел") },
        ],
      },
      people: {
        heading: L("Speakers", "Говорници"),
        items: [
          { id: "s1", name: L("Jane Doe", "Џејн До"), role: L("CEO, Horizon", "CEO, Horizon"), photo: "1.jpg" },
          { id: "s2", name: L("Ivan Kostov", "Иван Костов"), role: L("VP Design, Atlas", "VP Design, Atlas"), photo: "2.jpg" },
          { id: "s3", name: L("Mila Ristova", "Мила Ристова"), role: L("CTO, Northwind", "CTO, Northwind"), photo: "3.jpg" },
        ],
      },
      location: {
        heading: L("Venue", "Локација"),
        venues: [
          {
            id: "v1",
            name: L("The Grand Hall", "The Grand Hall"),
            address: L("Skopje, North Macedonia", "Скопје, Македонија"),
            mapsQuery: "Skopje, North Macedonia",
            note: L("Free parking for registered guests", "Бесплатен паркинг за пријавените гости"),
          },
        ],
      },
      footer: { contact: L("events@horizon.example", "events@horizon.example") },
    },
    photos: { visual: "1.jpg" },
  },
};
