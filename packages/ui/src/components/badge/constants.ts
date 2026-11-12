import type { EventStatus, LeadStage, TemplateStatus } from "@pokanito/shared";
import type { BadgeTone } from "./types";

export const eventStatusTone: Record<EventStatus, BadgeTone> = {
  live: "live",
  draft: "draft",
  "in-review": "review",
  past: "past",
  archived: "past",
};

export const templateStatusTone: Record<TemplateStatus, BadgeTone> = {
  live: "live",
  "coming-soon": "soon",
  hidden: "past",
  draft: "draft",
};

export const leadStageTone: Record<LeadStage, BadgeTone> = {
  new: "new",
  contacted: "review",
  "preview-sent": "soon",
  won: "live",
  live: "info",
  lost: "past",
};
