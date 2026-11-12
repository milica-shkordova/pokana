import type { TemplateSummary } from "@pokanito/shared";
import { useLang } from "../i18n";

/** Coming-soon chips under the gallery; each opens the "notify me" dialog. */
export default function ComingSoon({
  templates,
  onNotify,
}: {
  templates: TemplateSummary[];
  onNotify: (templateId: string) => void;
}) {
  const tt = useLang().t.templates;
  return (
    <div className="lp-soon lp-gallery__soon" data-reveal>
      <span className="lp-soon__label">{tt.comingSoon}</span>
      {templates.map((t) => (
        <button key={t.id} type="button" className="lp-soon__chip" onClick={() => onNotify(t.id)}>
          {t.name}
        </button>
      ))}
      <button type="button" className="lp-soon__notify" onClick={() => onNotify(templates[0]?.id ?? "")}>
        {tt.notifyMe}
      </button>
    </div>
  );
}
