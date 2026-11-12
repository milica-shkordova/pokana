import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "../cx";

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Positive status line, e.g. "Available". */
  ok?: ReactNode;
  full?: boolean;
  className?: string;
  /** A single control (Input / Select / Textarea / InputGroup). It receives id + aria props. */
  children: ReactElement;
}

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

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cx("ui-input", className)} {...rest} />;
});

interface InputGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: ReactNode;
  suffix?: ReactNode;
}

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

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...rest },
  ref,
) {
  return <select ref={ref} className={cx("ui-select", className)} {...rest} />;
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Monospace, non-wrapping — for JSON/code editing. */
  code?: boolean;
}

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

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx("ui-checkbox", className)}>
      <input type="checkbox" {...rest} />
      {label}
    </label>
  );
}

/** Responsive grid of fields (auto-fit, min 220px); <Field full> spans the row. */
export function FormGrid({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("ui-form-grid", className)} {...rest} />;
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

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

interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: ReactNode; ariaLabel?: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** Compact inline style (e.g. phone/desktop toggle). */
  inline?: boolean;
  className?: string;
}

/** Segmented control (radiogroup), e.g. Live / Coming soon / Hidden. */
export function Segmented<T extends string>({ options, value, onChange, label, inline, className }: SegmentedProps<T>) {
  // The selected option's white thumb slides between options.
  const group = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<CSSProperties | null>(null);
  useLayoutEffect(() => {
    const el = group.current;
    if (!el) return;
    const place = () => {
      const on = el.querySelector<HTMLElement>("[aria-checked=\"true\"]");
      setThumb(on ? { width: on.offsetWidth, height: on.offsetHeight, transform: `translate(${on.offsetLeft}px, ${on.offsetTop}px)` } : null);
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value, options.length]);
  return (
    <div ref={group} role="radiogroup" aria-label={label} className={cx("ui-segmented", inline && "ui-segmented--inline", className)}>
      {thumb && <span className="ui-segmented__thumb" style={thumb} aria-hidden />}
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          aria-label={o.ariaLabel}
          className="ui-segmented__option"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface SwatchesProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  size?: "md" | "lg";
}

/** Colour presets (template theme options). */
export function Swatches({ options, value, onChange, label, size = "md" }: SwatchesProps) {
  return (
    <div role="radiogroup" aria-label={label} className="ui-swatches">
      {options.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={c.toLowerCase() === value.toLowerCase()}
          aria-label={c}
          title={c}
          className={cx("ui-swatch", size === "lg" && "ui-swatch--lg")}
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}
