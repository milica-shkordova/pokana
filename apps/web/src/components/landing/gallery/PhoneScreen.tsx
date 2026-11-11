import { useCallback, useState } from "react";
import type { TemplateSummary } from "@momentelo/shared";
import { templateDefinitions } from "@momentelo/templates/definitions";
import { FRAME_H, FRAME_W } from "./geometry";
import { useLang } from "../i18n";

/** Static stand-in until (or instead of) the live demo: preview photo, or the template's colours + monogram. */
export function TemplateThumb({ t, className }: { t: TemplateSummary; className: string }) {
  if (t.previewUrl) {
    return (
      <div className={className}>
        <img src={t.previewUrl} alt="" loading="lazy" decoding="async" />
      </div>
    );
  }
  // Variants render with their layout; colour overrides come from Admin › Templates.
  const thumb = templateDefinitions[t.layoutId ?? t.id]?.thumb;
  return (
    <div className={className} style={{ background: t.thumb?.bg ?? thumb?.bg ?? "#E8E5D6" }} aria-hidden>
      <span className="lp-card__mono" style={{ color: t.thumb?.ink ?? thumb?.ink ?? "#4A4645", fontFamily: thumb?.font }}>
        {t.isVariant ? t.thumb.label : (thumb?.mono ?? t.name.split(" ")[0])}
      </span>
    </div>
  );
}

/** `inert` isn't in React 18's prop types; set it as an attribute. */
const makeInert = (el: HTMLElement | null) => el?.setAttribute("inert", "");

/**
 * A phone screen: the thumbnail, with the live demo page (`/{demoSlug}`) in a
 * scaled-down iframe on top once `live` is true. The iframe renders at a
 * 390px phone width and is scaled to the 242px screen, so the template shows
 * in its own fonts, palette and layout. It is decorative (the phone's link is
 * the real control): inert, hidden from assistive tech, no pointer events.
 */
export default function PhoneScreen({
  t,
  live,
  onFrameLoad,
}: {
  t: TemplateSummary;
  live: boolean;
  onFrameLoad?: (frame: HTMLIFrameElement) => void;
}) {
  const frameTitle = useLang().t.templates.frameTitle;
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(
    (e: React.SyntheticEvent<HTMLIFrameElement>) => {
      setLoaded(true);
      onFrameLoad?.(e.currentTarget);
    },
    [onFrameLoad],
  );

  return (
    <div className="lp-gallery__screen">
      <TemplateThumb t={t} className="lp-gallery__thumb" />
      {live && t.demoSlug && (
        <div className="lp-gallery__frame" ref={makeInert} aria-hidden>
          <iframe
            src={`/${t.demoSlug}?embed=1`}
            title={frameTitle(t.name)}
            width={FRAME_W}
            height={FRAME_H}
            loading="lazy"
            tabIndex={-1}
            aria-hidden
            sandbox="allow-scripts allow-same-origin"
            data-loaded={loaded || undefined}
            onLoad={onLoad}
          />
        </div>
      )}
    </div>
  );
}
