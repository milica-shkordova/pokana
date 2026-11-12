import { useRef, type ComponentType } from "react";
import type { PublicEvent } from "@pokanito/shared";
import { templateDefinitions } from "./definitions";
import { InvitationProvider, type SubmitRsvp } from "./engine/runtime";
import { useParallax, useReveal } from "./engine/hooks";
import ElegantWedding from "./elegant-wedding/Template";
import RusticWedding from "./rustic-wedding/Template";
import MinimalWedding from "./minimal-wedding/Template";
import KidsBirthday from "./kids-birthday/Template";
import MilestoneBirthday from "./milestone-birthday/Template";
import Corporate from "./corporate/Template";
import Christening from "./christening/Template";

/**
 * Template components by id. A template component takes no props — it reads
 * everything from useInvitation(). Add new templates here AND in
 * `./definitions.ts`.
 */
export const templateComponents: Record<string, ComponentType> = {
  "elegant-wedding": ElegantWedding,
  "rustic-wedding": RusticWedding,
  "minimal-wedding": MinimalWedding,
  "kids-birthday": KidsBirthday,
  "milestone-birthday": MilestoneBirthday,
  "conference-summit": Corporate,
  "product-launch": Corporate,
  "classic-christening": Christening,
  "floral-christening": Christening,
};

interface InvitationProps {
  event: PublicEvent;
  submitRsvp: SubmitRsvp;
  initialLocale?: PublicEvent["languages"][number];
}

/** Renders any event with its template. Used by the public site and previews. */
export function Invitation({ event, submitRsvp, initialLocale }: InvitationProps) {
  const def = templateDefinitions[event.templateId];
  const Component = templateComponents[event.templateId];
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  useParallax(root);
  if (!def || !Component) {
    return <p style={{ padding: 24 }}>Unknown template “{event.templateId}”.</p>;
  }
  return (
    <InvitationProvider event={event} def={def} submitRsvp={submitRsvp} initialLocale={initialLocale}>
      <div ref={root} className="pokanito-root" >
        <Component />
      </div>
    </InvitationProvider>
  );
}

export { InvitationProvider, useInvitation, fill } from "./engine/runtime";
export type { SubmitRsvp, InvitationContextValue } from "./engine/runtime";
export * from "./engine/hooks";
export * from "./engine/components";
export { useRsvpForm } from "./engine/useRsvpForm";
export * from "./definitions";
