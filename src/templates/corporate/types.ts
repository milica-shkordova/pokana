export interface CorporateConfig {
  eventName: string;
  tagline: string;
  eventDate: string;
  eventDateLabel: string;
  about: string;

  agenda: { time: string; title: string; speaker?: string }[];

  venue: {
    name: string;
    address: string;
    mapsQuery: string;
    mapsUrl: string;
  };

  registrationDeadline?: string;

  images: {
    hero: string;
    bands: string[];
  };

  title: string;
  favicon: string;
}
