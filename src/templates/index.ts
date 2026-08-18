import WeddingTemplate from "./wedding";
import BirthdayTemplate from "./birthday";
import CorporateTemplate from "./corporate";
import ChristeningTemplate from "./christening";
import { TemplateId } from "./types";

// Each template component has its own precise config type; the registry
// itself is necessarily loose (the config shape is only known once you've
// looked up the templateId), so callers get type safety from the individual
// template modules, not from this map.
type AnyTemplate = (props: { config: any; clientSlug: string }) => JSX.Element;

export const templates: Record<TemplateId, AnyTemplate> = {
  wedding: WeddingTemplate,
  birthday: BirthdayTemplate,
  corporate: CorporateTemplate,
  christening: ChristeningTemplate,
};

export * from "./types";
