import { ClientEntry } from "./types";

// Public demo instance used only by the Invy template gallery.
const client: ClientEntry = {
  slug: "demo-birthday",
  templateId: "birthday",
  config: {
    childName: "Mia",
    age: 7,
    partyDate: "2027-05-10",
    partyDateLabel: "May 10, 2027",
    message: "Join us for cake, games and lots of balloons as Mia turns 7!",
    theme: "superhero",
    venue: {
      name: "Sunny Meadows Park",
      address: "12 Meadow Lane, Springfield",
      mapsQuery: "Sunny+Meadows+Park",
      mapsUrl: "https://maps.google.com/?q=Sunny+Meadows+Park",
    },
    details: [
      { label: "Theme", value: "Superheroes" },
      { label: "Dress code", value: "Costumes welcome" },
      { label: "Bring", value: "Just your energy!" },
    ],
    rsvpDeadline: "May 1, 2027",
    images: {
      hero: "/assets/2.jpg",
      bands: ["/assets/3.jpg"],
    },
    title: "Mia's 7th Birthday",
    favicon:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎈</text></svg>",
  },
};

export default client;
