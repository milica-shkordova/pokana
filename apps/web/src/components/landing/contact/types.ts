import type { LeadInput, TemplateSummary } from "@pokanito/shared";

export interface ContactProps {
  templates: TemplateSummary[];
  contactEmail: string;
}

export interface NotifyDialogProps {
  open: boolean;
  onClose: () => void;
  templates: TemplateSummary[];
  initialTemplateId: string;
}

export type LeadSource = LeadInput["source"];

export type LeadStatus = "idle" | "sending" | "sent";
