import { CATEGORY_LABELS, type TemplateSummary } from "@pokanito/shared";
import { getDefinition } from "@pokanito/templates/definitions";
import { cx } from "@pokanito/ui";
import { thumbStyle } from "./TemplateThumb";

/** A template drawn as a small phone: its preview photo, or its colours and monogram. */
export default function PhoneThumb({ t, size = "sm" }: { t: TemplateSummary; size?: "sm" | "lg" }) {
  const s = thumbStyle(t);
  const def = getDefinition(t.layoutId);
  return (
    <span className={cx("admin-pick-phone", `admin-pick-phone--${size}`)}>
      <span className="admin-pick-phone__screen" style={{ background: s.bg, color: s.ink, fontFamily: s.font }}>
        {t.previewUrl ? (
          <img src={t.previewUrl} alt="" />
        ) : (
          <>
            <span className="admin-pick-phone__eyebrow">{CATEGORY_LABELS[t.category].one}</span>
            <span className="admin-pick-phone__mono">{def?.thumb.mono ?? s.label}</span>
            <span className="admin-pick-phone__block" style={{ background: s.ink }} />
            <span className="admin-pick-phone__line" />
            <span className="admin-pick-phone__line admin-pick-phone__line--short" />
          </>
        )}
      </span>
    </span>
  );
}
