import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "../cx";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** danger: turns red on hover (remove / delete). */
  tone?: "default" | "danger";
  size?: "sm" | "md";
}

/** Square, borderless icon-only button (row controls). Pass an aria-label. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { tone = "default", size = "md", className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("ui-icon-btn", size === "sm" && "ui-icon-btn--sm", tone === "danger" && "ui-icon-btn--danger", className)}
      {...rest}
    />
  );
});
