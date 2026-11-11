// React-free entry: `@momentelo/templates/definitions`. Safe to import from the
// API and the admin panel — never import components or styles here.

import type { TemplateDefinition } from "./engine/types";
import { elegantWedding } from "./elegant-wedding/definition";
import { rusticWedding } from "./rustic-wedding/definition";
import { minimalWedding } from "./minimal-wedding/definition";
import { kidsBirthday } from "./kids-birthday/definition";
import { milestoneBirthday } from "./milestone-birthday/definition";
import { conferenceSummit, productLaunch } from "./corporate/definitions";
import { classicChristening, floralChristening } from "./christening/definitions";

/**
 * Every implemented template, in gallery order. Add new templates here AND
 * in `./index.ts` (components). The DB `Template` row (status, order,
 * description, demo) is created by the seed from these.
 */
export const templateList: TemplateDefinition[] = [
  elegantWedding,
  rusticWedding,
  minimalWedding,
  kidsBirthday,
  milestoneBirthday,
  conferenceSummit,
  productLaunch,
  classicChristening,
  floralChristening,
];

export const templateDefinitions: Record<string, TemplateDefinition> = Object.fromEntries(
  templateList.map((d) => [d.id, d]),
);

export function getDefinition(id: string): TemplateDefinition | undefined {
  return templateDefinitions[id];
}

export * from "./engine/types";
export * from "./engine/checklist";
export { baseStrings, type UiStrings } from "./engine/strings";
