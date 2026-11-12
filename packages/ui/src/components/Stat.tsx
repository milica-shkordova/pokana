import type { ReactNode } from "react";
import { cx } from "../cx";
import { Card } from "./card/Card";

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  hintTone?: "default" | "good" | "warn";
}

export function Stat({ label, value, hint, hintTone = "default" }: StatProps) {
  return (
    <Card padding="none" className="ui-stat">
      <span className="ui-stat__label">{label}</span>
      <span className="ui-stat__value">{value}</span>
      {hint && (
        <span
          className={cx(
            "ui-stat__hint",
            hintTone !== "default" && `ui-stat__hint--${hintTone}`,
          )}
        >
          {hint}
        </span>
      )}
    </Card>
  );
}
