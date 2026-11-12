import type { TemplateSummary } from "@pokanito/shared";
import { CategoryLabel } from "@pokanito/ui";
import { useLang } from "../i18n";
import { TemplateThumb } from "./PhoneScreen";

/** Reduced motion: the static card grid (Landing.dc.html). */
export default function CardGrid({ templates }: { templates: TemplateSummary[] }) {
  const tt = useLang().t.templates;
  return (
    <div className="lp-cards">
      {templates.map((t) => (
        <a key={t.id} className="lp-card" href={`/${t.demoSlug}`} target="_blank" rel="noreferrer">
          <TemplateThumb t={t} className="lp-card__thumb" />
          <div className="lp-card__body">
            <CategoryLabel>{tt.categories[t.category].one}</CategoryLabel>
            <span className="lp-card__name">{t.name}</span>
            <span className="lp-card__desc">{t.description}</span>
            <span className="lp-card__cta">{tt.viewDemo}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
