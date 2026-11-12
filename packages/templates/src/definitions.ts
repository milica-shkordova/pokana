// React-free entry: `@pokanito/templates/definitions`. Safe to import from the
// API and the admin panel — never import components or styles here (import
// `<template>/definition`, not the template folder's index).

import type { TemplateSummary } from "@pokanito/shared";
import type { TemplateDefinition } from "./engine/types";
import { definitions as elegantWedding } from "./elegant-wedding/definition";
import { definitions as rusticWedding } from "./rustic-wedding/definition";
import { definitions as minimalWedding } from "./minimal-wedding/definition";
import { definitions as kidsBirthday } from "./kids-birthday/definition";
import { definitions as milestoneBirthday } from "./milestone-birthday/definition";
import { definitions as corporate } from "./corporate/definition";
import { definitions as christening } from "./christening/definition";

/**
 * Every implemented template, by design (= folder under src/, one component
 * each), in gallery order. This is the one place a template is registered:
 * a new catalog entry of an existing design goes into its folder's
 * `definitions`; a new design is added here, and the typecheck then requires
 * its component in `./index.tsx`. The DB `Template` row (status, order,
 * description, demo) is created by the seed from these.
 */
export const designs = {
  "elegant-wedding": elegantWedding,
  "rustic-wedding": rusticWedding,
  "minimal-wedding": minimalWedding,
  "kids-birthday": kidsBirthday,
  "milestone-birthday": milestoneBirthday,
  corporate,
  christening,
} satisfies Record<string, TemplateDefinition[]>;

export type DesignId = keyof typeof designs;

export const templateList: TemplateDefinition[] = Object.values(designs).flat();

export const templateDefinitions: Record<string, TemplateDefinition> = Object.fromEntries(
  templateList.map((d) => [d.id, d]),
);

/** Template id → the design (component) that renders it. */
export const designOf: Record<string, DesignId> = Object.fromEntries(
  Object.entries(designs).flatMap(([design, defs]) => defs.map((d) => [d.id, design as DesignId])),
);

export function getDefinition(id: string): TemplateDefinition | undefined {
  return templateDefinitions[id];
}

/** Colours used when a template has no definition (unknown / not implemented). */
export interface ThumbFallback {
  bg: string;
  ink: string;
  font?: string;
}

/**
 * Colours and font a template card / placeholder thumbnail is drawn with:
 * the overrides from Admin › Templates, else the layout's own, else `fallback`.
 */
export function thumbStyle(t: Pick<TemplateSummary, "layoutId" | "thumb">, fallback: ThumbFallback) {
  const base = templateDefinitions[t.layoutId]?.thumb;
  return {
    bg: t.thumb.bg ?? base?.bg ?? fallback.bg,
    ink: t.thumb.ink ?? base?.ink ?? fallback.ink,
    font: base?.font ?? fallback.font,
    /** The layout's monogram ("2027", "A&M"), if it has one. */
    mono: base?.mono,
    label: t.thumb.label,
  };
}

export * from "./engine/types";
export * from "./engine/sections";
export * from "./engine/checklist";
export { baseStrings, type UiStrings } from "./engine/strings";
