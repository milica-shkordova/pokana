export interface ChristeningConfig {
  childName: string;
  parentNames: string;
  ceremonyDate: string;
  ceremonyDateLabel: string;
  message: string;

  program: { time: string; description: string }[];

  venue: {
    name: string;
    address: string;
    mapsQuery: string;
    mapsUrl: string;
  };

  rsvpDeadline?: string;

  images: {
    hero: string;
    bands: string[];
  };

  title: string;
  favicon: string;
}
