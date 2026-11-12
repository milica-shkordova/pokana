import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../cx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "compact" | "default";
}

export function Card({ padding = "default", className, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        "ui-card",
        padding === "default" && "ui-card--padded",
        padding === "compact" && "ui-card--compact",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="ui-card__header">
      <div className="ui-card__heading">
        <h2 className="ui-card__title">{title}</h2>
        {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
