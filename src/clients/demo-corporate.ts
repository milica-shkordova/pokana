import { ClientEntry } from "./types";

// Public demo instance used only by the Invy template gallery.
const client: ClientEntry = {
  slug: "demo-corporate",
  templateId: "corporate",
  config: {
    eventName: "Horizon Summit 2027",
    tagline: "A one-day gathering for product and design leaders.",
    eventDate: "2027-03-12",
    eventDateLabel: "March 12, 2027",
    about:
      "Horizon Summit brings together product, design and engineering leaders for a day of talks, workshops and conversation about what's next.",
    agenda: [
      { time: "09:00", title: "Registration & coffee" },
      { time: "09:30", title: "Opening keynote", speaker: "Jane Doe, CEO" },
      { time: "11:00", title: "Panel: Building for scale", speaker: "Guest panel" },
      { time: "13:00", title: "Lunch" },
      { time: "14:00", title: "Workshops" },
      { time: "17:00", title: "Closing reception" },
    ],
    venue: {
      name: "The Grand Hall",
      address: "88 Business Ave, Metro City",
      mapsQuery: "The+Grand+Hall,+Metro+City",
      mapsUrl: "https://maps.google.com/?q=The+Grand+Hall",
    },
    registrationDeadline: "March 1, 2027",
    images: {
      hero: "/assets/3.jpg",
      bands: ["/assets/1.jpg"],
    },
    title: "Horizon Summit 2027",
    favicon:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>",
  },
};

export default client;
