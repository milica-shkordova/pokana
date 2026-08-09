import WeddingTemplate from "./wedding";
import { TemplateId } from "./types";

export const templates: Record<TemplateId, typeof WeddingTemplate> = {
  wedding: WeddingTemplate,
};

export * from "./types";
