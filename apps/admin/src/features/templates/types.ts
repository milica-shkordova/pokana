import type { EventDetail, TemplateCategory } from "@pokanito/shared";

/** Category filter: one category, or all of them. */
export type Cat = "all" | TemplateCategory;

/** The parts of a template's defaults event the side panel edits (palette, sections). */
export type DefaultsPatch = Partial<Pick<EventDetail, "theme" | "sections">>;
