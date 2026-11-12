import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cx } from "../cx";

/** Wrapping row of chips. */
export function Chips({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("ui-chips", className)} {...rest} />;
}

/** A small labelled tag. */
export function Chip({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("ui-chip", className)} {...rest} />;
}

export interface ToggleChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** On: included. Off: struck through and dashed. */
  pressed: boolean;
}

/** A chip that toggles something on and off (aria-pressed). */
export function ToggleChip({ pressed, className, ...rest }: ToggleChipProps) {
  return (
    <button
      type="button"
      className={cx("ui-chip", "ui-chip--toggle", !pressed && "ui-chip--off", className)}
      aria-pressed={pressed}
      {...rest}
    />
  );
}
