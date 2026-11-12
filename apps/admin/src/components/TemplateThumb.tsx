import type { TemplateSummary } from "@pokanito/shared";
import { thumbStyle as baseThumbStyle } from "@pokanito/templates/definitions";

const FALLBACK = { bg: "#F0E2D6", ink: "#7A6E66", font: "'Cormorant Garamond', serif" };

/** Colours/font a template card is drawn with: overrides from Templates, else the layout's own. */
export const thumbStyle = (t: Pick<TemplateSummary, "layoutId" | "thumb">) => baseThumbStyle(t, FALLBACK);

/** The big-word card thumbnail from the Templates design ("Elegant", "Kids", …). */
export default function TemplateThumb({ t, children }: { t: Pick<TemplateSummary, "layoutId" | "thumb">; children?: React.ReactNode }) {
  const s = thumbStyle(t);
  return (
    <span className="admin-template-card__thumb" style={{ background: s.bg }}>
      {children}
      <span className="admin-template-card__word" style={{ fontFamily: s.font, color: s.ink }}>
        {s.label}
      </span>
    </span>
  );
}
