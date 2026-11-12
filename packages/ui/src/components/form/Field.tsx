import { cloneElement, isValidElement, useId, type ReactElement } from "react";
import { cx } from "../../cx";
import type { FieldProps } from "./types";

/** Label + control + hint/error, with ids and aria attributes wired up. */
export function Field({ label, hint, error, ok, full, className, children }: FieldProps) {
  const autoId = useId();
  const childProps = isValidElement<{ id?: string }>(children) ? children.props : {};
  const id = childProps.id ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const control = cloneElement(children as ReactElement<Record<string, unknown>>, {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
  });

  return (
    <div className={cx("ui-field", full && "ui-field--full", className)}>
      {label && (
        <label className="ui-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      {control}
      {error ? (
        <span className="ui-field__error" id={errorId}>
          {error}
        </span>
      ) : ok ? (
        <span className="ui-field__ok">{ok}</span>
      ) : (
        hint && (
          <span className="ui-field__hint" id={hintId}>
            {hint}
          </span>
        )
      )}
    </div>
  );
}
