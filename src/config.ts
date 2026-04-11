// ─── Wedding Config ───────────────────────────────────────────────────────────
// Edit this file to reuse the invitation for a new wedding.

const config = {
  // Names displayed throughout the site
  bride: "Татјана",
  groom: "Драган",

  // Wedding date — used by the countdown timer
  // Format: ISO 8601, set the time to when the ceremony starts
  weddingDate: new Date("2026-06-28"),

  // Human-readable date shown in the hero and RSVP notification
  weddingDateLabel: "28 јуни 2026",

  venue: {
    name: 'Ресторан „Ксантика"',
    address: "1640 9, Хиподром, Скопје",
    // Query used inside the Google Maps embed iframe
    mapsQuery: "Ресторан+Ксантика,+Хиподром,+Скопје",
    // "Open in Maps" link
    mapsUrl: "https://maps.app.goo.gl/xD32BHvULLc4ZTwg7",
  },

  program: [
    { time: "15:15", description: 'Црква „Рождество на Пресвета Богородица"' },
    { time: "18:30", description: 'Матично (ресторан „Ксантика")' },
    { time: "19:00 - 19:30", description: "Прием на гости 🥂" },
  ],

  // Deadline shown in the RSVP section
  rsvpDeadline: "10 јуни 2026",

  // Images — paths relative to /public
  images: {
    // Main hero photo
    hero: "/assets/slika.jpeg",
    // Photos shown in the image band sections between content blocks.
    // Add more paths to show different images in each band.
    bands: ["/assets/slika.jpeg", "/assets/slika.jpeg"],
  },

  // Browser tab title
  title: "Татјана & Драган · 28 јуни 2026",

  // Favicon — emoji SVG (works without a file) or set a path like "/assets/favicon.ico"
  favicon:
    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎉</text></svg>",

  // Background music — path relative to /public
  music: "/assets/music.mp3",

  // Web3Forms access key (https://web3forms.com)
  web3formsKey: "abae5b86-f1c2-4456-9534-dab1cd266256",
} as const;

export default config;
