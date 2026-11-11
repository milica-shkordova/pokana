import type { TemplateSummary } from "@momentelo/shared";
import { getDefinition } from "@momentelo/templates/definitions";

const FALLBACK = { bg: "#F0E2D6", ink: "#7A6E66", font: "'Cormorant Garamond', serif" };

/** Colours/font a template card is drawn with: overrides from Templates, else the layout's own. */
export function thumbStyle(t: Pick<TemplateSummary, "layoutId" | "thumb">) {
  const base = getDefinition(t.layoutId)?.thumb ?? FALLBACK;
  return { bg: t.thumb.bg ?? base.bg, ink: t.thumb.ink ?? base.ink, font: base.font, label: t.thumb.label };
}

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
