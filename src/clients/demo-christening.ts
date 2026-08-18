import { ClientEntry } from "./types";

// Public demo instance used only by the Invy template gallery.
const client: ClientEntry = {
  slug: "demo-christening",
  templateId: "christening",
  config: {
    childName: "Sofia",
    parentNames: "Ana & Marko",
    ceremonyDate: "2027-04-18",
    ceremonyDateLabel: "April 18, 2027",
    message:
      "With joyful hearts, we invite you to celebrate the christening of our daughter, Sofia.",
    program: [
      { time: "11:00", description: "Ceremony at St. Mary's Church" },
      { time: "13:00", description: "Reception to follow" },
    ],
    venue: {
      name: "St. Mary's Church",
      address: "5 Chapel Street, Rivertown",
      mapsQuery: "St+Mary's+Church,+Rivertown",
      mapsUrl: "https://maps.google.com/?q=St+Mary%27s+Church",
    },
    rsvpDeadline: "April 5, 2027",
    images: {
      hero: "/assets/slika.jpeg",
      bands: ["/assets/2.jpg"],
    },
    title: "Sofia's Christening",
    favicon:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕊</text></svg>",
  },
};

export default client;
