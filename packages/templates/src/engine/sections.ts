import type { SectionState } from "@pokanito/shared";
import type { TemplateDefinition } from "./types";

// Pure helpers over a template definition. React-free (the API uses them too).

export function defaultSections(def: TemplateDefinition): SectionState[] {
  return def.sections.map((s) => ({ id: s.id, enabled: s.defaultEnabled }));
}

export function defaultTheme(def: TemplateDefinition): Record<string, string> {
  return Object.fromEntries(def.themeOptions.map((o) => [o.key, o.default]));
}

/**
 * Sections to render, in the event's order, limited to what the template
 * supports. New template sections the event doesn't know about yet are
 * appended with their default state.
 */
export function resolveSections(def: TemplateDefinition, stored: SectionState[] | undefined): SectionState[] {
  const known = new Set(def.sections.map((s) => s.id));
  const out = (stored ?? []).filter((s) => known.has(s.id));
  for (const s of def.sections) {
    if (!out.some((o) => o.id === s.id)) out.push({ id: s.id, enabled: s.defaultEnabled });
  }
  return out.map((s) => (def.sections.find((d) => d.id === s.id)?.required ? { ...s, enabled: true } : s));
}
