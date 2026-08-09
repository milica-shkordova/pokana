import { ClientEntry } from "./types";

const client: ClientEntry = {
  slug: "tatjana-i-dragan",
  templateId: "wedding",
  config: {
    bride: "Татјана",
    groom: "Драган",
    weddingDate: "2026-06-28",
    weddingDateLabel: "28 јуни 2026",
    venue: {
      name: 'Ресторан „Ксантика"',
      address: "1640 9, Хиподром, Скопје",
      mapsQuery: "Ресторан+Ксантика,+Хиподром,+Скопје",
      mapsUrl: "https://maps.app.goo.gl/xD32BHvULLc4ZTwg7",
    },
    program: [
      { time: "15:15", description: 'Црква „Рождество на Пресвета Богородица"' },
      { time: "18:30", description: 'Матично (ресторан „Ксантика")' },
      { time: "19:00 - 19:30", description: "Прием на гости 🥂" },
    ],
    rsvpDeadline: "10 јуни 2026",
    images: {
      hero: "/assets/1.jpg",
      bands: ["/assets/2.jpg", "/assets/3.jpg"],
    },
    title: "Татјана & Драган · 28 јуни 2026",
    favicon:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎉</text></svg>",
    music: "/assets/music.mp3",
  },
};

export default client;
