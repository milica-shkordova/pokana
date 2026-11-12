import { cx } from "../../cx";
import type { CheckboxProps } from "./types";

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx("ui-checkbox", className)}>
      <input type="checkbox" {...rest} />
      {label}
    </label>
  );
}
