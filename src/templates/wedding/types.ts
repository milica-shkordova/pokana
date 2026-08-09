export interface WeddingConfig {
  // Names displayed throughout the site
  bride: string;
  groom: string;

  // Wedding date (ISO 8601 string) — used by the countdown timer.
  // Kept as a string (not a Date) because these configs pass through
  // Next.js getStaticProps, which JSON-serializes props for hydration —
  // a Date instance would silently become a string on the client anyway.
  weddingDate: string;

  // Human-readable date shown in the hero and RSVP notification
  weddingDateLabel: string;

  venue: {
    name: string;
    address: string;
    // Query used inside the Google Maps embed iframe
    mapsQuery: string;
    // "Open in Maps" link
    mapsUrl: string;
  };

  program: { time: string; description: string }[];

  // Deadline shown in the RSVP section
  rsvpDeadline: string;

  // Images — paths relative to /public
  images: {
    hero: string;
    bands: string[];
  };

  // Browser tab title
  title: string;

  // Favicon — emoji SVG data URI or a path like "/assets/favicon.ico"
  favicon: string;

  // Background music — path relative to /public
  music: string;
}
