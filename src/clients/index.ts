import { ClientEntry } from "./types";
import tatjanaIDragan from "./tatjana-i-dragan";
import demoWedding from "./demo-wedding";
import demoBirthday from "./demo-birthday";
import demoCorporate from "./demo-corporate";
import demoChristening from "./demo-christening";

// Add a new client by creating a file in this folder (see tatjana-i-dragan.ts
// for the shape) and registering it here. Each client also needs a
// NEXT_PUBLIC_WEB3FORMS_KEY_<SLUG> entry in .env.local (see .env.example).
const clients: ClientEntry[] = [
  tatjanaIDragan,
  demoWedding,
  demoBirthday,
  demoCorporate,
  demoChristening,
];

export function getAllSlugs(): string[] {
  return clients.map((c) => c.slug);
}

export function getClientBySlug(slug: string): ClientEntry | undefined {
  return clients.find((c) => c.slug === slug);
}
