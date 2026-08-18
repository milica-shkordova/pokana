export type BirthdayTheme = "superhero" | "princess";

export interface BirthdayConfig {
  childName: string;
  age: number;
  partyDate: string;
  partyDateLabel: string;
  message: string;

  // Pick based on what the child's into — drives accent colors, confetti,
  // and the themed art banner below. Leave unset for a neutral palette.
  theme?: BirthdayTheme;

  venue: {
    name: string;
    address: string;
    mapsQuery: string;
    mapsUrl: string;
  };

  // Chips shown in the "Party details" section, e.g. Theme, Dress code
  details: { label: string; value: string }[];

  rsvpDeadline?: string;

  images: {
    hero: string;
    bands: string[];
    // A themed illustration (superhero burst, princess castle, etc.) shown
    // in the banner below the hero. Until this is supplied, the banner
    // shows a clearly-labeled placeholder instead.
    themeArt?: string;
  };

  title: string;
  favicon: string;
}
