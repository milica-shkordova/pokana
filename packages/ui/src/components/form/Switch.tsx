import type { ReactNode } from "react";
import { cx } from "../../cx";
import type { SwitchProps } from "./types";

/** On/off switch (role="switch"). Pass a visible label via <SwitchRow> or an aria label. */
export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cx("ui-switch", className)}
      onClick={() => onChange(!checked)}
    />
  );
}

/** Label + hint on the left, switch on the right (Settings toggles). */
export function SwitchRow({ label, hint, ...rest }: SwitchProps & { hint?: ReactNode }) {
  return (
    <div className="ui-switch-row">
      <div className="ui-switch-row__text">
        <span className="ui-switch-row__label">{label}</span>
        {hint && <span className="ui-switch-row__hint">{hint}</span>}
      </div>
      <Switch label={label} {...rest} />
    </div>
  );
}
