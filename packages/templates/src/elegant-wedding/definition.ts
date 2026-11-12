import type { TemplateDefinition } from "../engine/types";

const L = (mk: string, en: string) => ({ mk, en });

/** The original, live template — its look is unchanged; it now renders event content. */
export const elegantWedding: TemplateDefinition = {
  id: "elegant-wedding",
  name: "Elegant Wedding",
  category: "wedding",
  description:
    "A scroll-animated wedding invitation with a splash screen and music, countdown, program, RSVP with menu choice and map.",
  tagline: "Countdown, program, RSVP with menu and map.",
  thumb: { bg: "#E8E5D6", ink: "#4A4645", font: "'Cormorant Garamond', serif", mono: "A & M" },
  fonts: {
    href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Great+Vibes&family=Manrope:wght@200..800&display=swap&subset=cyrillic",
    heading: "Cormorant Garamond",
    body: "Manrope",
  },
  sections: [
    { id: "welcome", label: "Welcome text", defaultEnabled: true },
    { id: "countdown", label: "Countdown", defaultEnabled: true },
    { id: "program", label: "Program", defaultEnabled: true },
    { id: "rsvp", label: "RSVP form", defaultEnabled: true },
    { id: "location", label: "Location & map", defaultEnabled: true, required: true },
    { id: "music", label: "Music", defaultEnabled: false },
    { id: "footer", label: "Footer", defaultEnabled: true },
  ],
  photoSlots: [
    { id: "hero", label: "Hero", aspect: "4:5", required: true },
    { id: "mid", label: "Mid-page", aspect: "16:9", required: true },
    { id: "beforeLocation", label: "Before location", aspect: "16:9", required: false },
  ],
  themeOptions: [
    { key: "paper", label: "Paper", default: "#E9E7D8", options: ["#E9E7D8", "#F3EFE6", "#E6EAE4", "#F1E6E4"] },
  ],
  rsvpMode: "guests-with-menu",
  defaultLanguages: ["mk"],
  defaultContent: {
    names: L("[Невеста] & [Младоженец]", "[Bride] & [Groom]"),
    partnerOne: L("[Невеста]", "[Bride]"),
    partnerTwo: L("[Младоженец]", "[Groom]"),
    city: L("Скопје", "Skopje"),
    welcome: {
      heading: L("Драги наши,", "Dear friends,"),
      text: L(
        "Со огромна радост и среќа ве покануваме да бидете дел од нашиот најсреќен ден.\n\nВашето присуство ќе го направи овој момент уште поспецијален и незаборавен за нас.",
        "With great joy we invite you to be part of the happiest day of our lives.\n\nYour presence will make this moment even more special and unforgettable for us.",
      ),
    },
    countdown: { heading: L("Свадбата започнува за:", "The wedding begins in:") },
    program: {
      heading: L("Програма", "Program"),
      items: [
        { id: "p1", time: "16:00", title: L("Црковен обред", "Church ceremony"), place: L("[Црква]", "[Church]") },
        { id: "p2", time: "19:00", title: L("Прием на гости 🥂", "Welcome reception 🥂"), place: L("[Ресторан]", "[Venue]") },
      ],
    },
    rsvp: {
      mode: "guests-with-menu",
      heading: L("Потврди присуство", "Confirm attendance"),
      menuOptions: ["Регуларно", "Вегетаријанско", "Веганско", "Детско"],
      askAllergies: false,
      askMessage: false,
    },
    location: {
      heading: L("Локација", "Location"),
      venues: [{ id: "v1", name: L("[Ресторан]", "[Venue]"), address: L("[Адреса], Скопје", "[Address], Skopje"), mapsQuery: "" }],
    },
    music: { mediaId: null },
    footer: { text: L("Со нетрпение ве очекуваме", "We can't wait to celebrate with you") },
    photos: {},
  },
  demo: {
    slug: "demo-elegant-wedding",
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
          { id: "p1", time: "16:00", title: L("Црковен обред", "Church ceremony") },
          { id: "p2", time: "19:00", title: L("Прием на гости 🥂", "Welcome reception 🥂") },
        ],
      },
      location: {
        heading: L("Локација", "Location"),
        venues: [
          { id: "v1", name: L("Демо локација", "Demo venue"), address: L("Скопје, Македонија", "Skopje, North Macedonia"), mapsQuery: "Скопје, Македонија" },
        ],
      },
    },
    photos: { hero: "1.jpg", mid: "2.jpg", beforeLocation: "3.jpg" },
    music: "music.mp3",
  },
  strings: {
    mk: {
      days: "денови",
      hours: "часови",
      minutes: "минути",
      seconds: "секунди",
      countdownDone: "Свадбата е започната",
      rsvpDeadline: "Ве замолуваме да го потврдите вашето присуство најдоцна до {date}",
      attending: "Ќе присуствувам",
      notAttending: "За жал нема да можам да присуствувам",
      openInMaps: "Отвори на мапа ↗",
    },
    en: {
      days: "days",
      hours: "hours",
      minutes: "minutes",
      seconds: "seconds",
      countdownDone: "The wedding has begun",
      rsvpDeadline: "Kindly confirm your attendance by {date}",
      openInMaps: "Open in maps ↗",
    },
  },
};

/** Catalog entries this design renders, in gallery order. */
export const definitions: TemplateDefinition[] = [elegantWedding];
