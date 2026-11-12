import type { HTMLAttributes } from "react";
import { cx } from "../../cx";

/** Responsive grid of fields (auto-fit, min 220px); <Field full> spans the row. */
export function FormGrid({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("ui-form-grid", className)} {...rest} />;
}
