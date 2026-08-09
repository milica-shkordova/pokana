import { ClientEntry } from "./types";

// Public demo instance used only by the Invy template gallery — sanitized
// placeholder data, not a real client. Keep this separate from real client
// files so demo traffic never touches a real couple's RSVP inbox.
const client: ClientEntry = {
  slug: "demo-wedding",
  templateId: "wedding",
  config: {
    bride: "Ана",
    groom: "Марко",
    weddingDate: "2027-09-18",
    weddingDateLabel: "18 септември 2027",
    venue: {
      name: "Демо локација",
      address: "Скопје, Македонија",
      mapsQuery: "Скопје,+Македонија",
      mapsUrl: "https://maps.google.com/?q=Скопје",
    },
    program: [
      { time: "16:00", description: "Црковен обред (пример)" },
      { time: "19:00", description: "Прием на гости (пример)" },
    ],
    rsvpDeadline: "1 септември 2027",
    images: {
      hero: "/assets/1.jpg",
      bands: ["/assets/2.jpg", "/assets/3.jpg"],
    },
    title: "Демо — Ана & Марко (Invy пример)",
    favicon:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎉</text></svg>",
    music: "/assets/music.mp3",
  },
};

export default client;
