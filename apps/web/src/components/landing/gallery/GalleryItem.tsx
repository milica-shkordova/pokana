import type { TemplateSummary } from "@pokanito/shared";
import { fmt } from "@/content/landing";
import { useLang } from "../i18n";
import PhoneScreen from "./PhoneScreen";
import { HIDDEN } from "./constants";

/** One phone in the sideways gallery; filtered-out phones stay in the DOM, hidden. */
export default function GalleryItem({
  t,
  hidden,
  live,
  onFrameLoad,
}: {
  t: TemplateSummary;
  hidden: boolean;
  live: boolean;
  onFrameLoad: (frame: HTMLIFrameElement) => void;
}) {
  const tt = useLang().t.templates;
  return (
    <div className={`lp-gallery__item${hidden ? ` ${HIDDEN}` : ""}`} data-id={t.id}>
      <div className="lp-gallery__phone">
        <PhoneScreen t={t} live={live} onFrameLoad={onFrameLoad} />
      </div>
      <div className="lp-gallery__meta" aria-hidden>
        <span className="lp-gallery__cat">{tt.categories[t.category].one}</span>
        <span className="lp-gallery__name">{t.name}</span>
      </div>
      <a
        className="lp-gallery__link"
        href={`/${t.demoSlug}`}
        target="_blank"
        rel="noreferrer"
        aria-label={fmt(tt.openDemoAria, { name: t.name })}
        data-cursor={tt.openDemo}
      />
    </div>
  );
}
