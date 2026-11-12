import type { HTMLAttributes } from "react";
import { cx } from "../cx";

export type AlertTone = "info" | "success" | "warning" | "danger";

export function Alert({
  tone = "info",
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cx("ui-alert", `ui-alert--${tone}`, className)}
      {...rest}
    />
  );
}
