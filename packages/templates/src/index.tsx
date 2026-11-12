import { useRef, type ComponentType } from "react";
import type { PublicEvent } from "@pokanito/shared";
import { designOf, templateDefinitions, type DesignId } from "./definitions";
import { InvitationProvider, type SubmitRsvp } from "./engine/runtime";
import { useParallax, useReveal } from "./engine/hooks";
import * as elegantWedding from "./elegant-wedding";
import * as rusticWedding from "./rustic-wedding";
import * as minimalWedding from "./minimal-wedding";
import * as kidsBirthday from "./kids-birthday";
import * as milestoneBirthday from "./milestone-birthday";
import * as corporate from "./corporate";
import * as christening from "./christening";

/**
 * Component of each design. Designs (and their catalog entries) are
 * registered in `./definitions.ts`; this record must cover every one of them
 * (the typecheck fails otherwise). A template component takes no props — it
 * reads everything from useInvitation().
 */
const designComponents: Record<DesignId, ComponentType> = {
  "elegant-wedding": elegantWedding.Component,
  "rustic-wedding": rusticWedding.Component,
  "minimal-wedding": minimalWedding.Component,
  "kids-birthday": kidsBirthday.Component,
  "milestone-birthday": milestoneBirthday.Component,
  corporate: corporate.Component,
  christening: christening.Component,
};

/** Template components by template id. */
export const templateComponents: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(designOf).map(([id, design]) => [id, designComponents[design]]),
);

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
export * from "./engine/rsvp";
export { TemplateShell, type SectionRenderer, type SectionRenderers } from "./engine/TemplateShell";
export { useRsvpForm } from "./engine/useRsvpForm";
export * from "./definitions";
