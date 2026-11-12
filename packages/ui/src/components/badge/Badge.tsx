import { cx } from "../../cx";
import type { BadgeProps } from "./types";

export function Badge({
  tone = "draft",
  size = "md",
  caps,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(
        "ui-badge",
        `ui-badge--${tone}`,
        size === "sm" && "ui-badge--sm",
        caps && "ui-badge--caps",
        className,
      )}
      {...rest}
    />
  );
}
