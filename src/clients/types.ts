import { TemplateId } from "@/templates/types";
import { WeddingConfig } from "@/templates/wedding/types";
import { BirthdayConfig } from "@/templates/birthday/types";
import { CorporateConfig } from "@/templates/corporate/types";
import { ChristeningConfig } from "@/templates/christening/types";

export type AnyTemplateConfig =
  | WeddingConfig
  | BirthdayConfig
  | CorporateConfig
  | ChristeningConfig;

export interface ClientEntry {
  slug: string;
  templateId: TemplateId;
  config: AnyTemplateConfig;
}
