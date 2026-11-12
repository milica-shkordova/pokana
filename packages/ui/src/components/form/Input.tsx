import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../../cx";
import type { InputGroupProps, SelectProps, TextareaProps } from "./types";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cx("ui-input", className)} {...rest} />;
});

/** Input with a fixed prefix/suffix, e.g. "pokanito.mk/" … "Available". */
export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(function InputGroup(
  { prefix, suffix, className, ...rest },
  ref,
) {
  return (
    <div className={cx("ui-input-group", className)}>
      {prefix && <span className="ui-input-group__addon ui-input-group__addon--prefix">{prefix}</span>}
      <input ref={ref} className="ui-input" {...rest} />
      {suffix && <span className="ui-input-group__addon">{suffix}</span>}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, code, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cx("ui-textarea", code && "ui-textarea--code", className)}
      spellCheck={code ? false : rest.spellCheck}
      {...rest}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, size = "md", ...rest },
  ref,
) {
  return <select ref={ref} className={cx("ui-select", size === "sm" && "ui-select--sm", className)} {...rest} />;
});
