import { TemplateId } from "@/templates/types";
import { WeddingConfig } from "@/templates/wedding/types";

export interface ClientEntry {
  slug: string;
  templateId: TemplateId;
  config: WeddingConfig;
}
