import type {
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export interface FieldProps {
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

export interface InputGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** sm: compact toolbar select (filters, sort, role pickers). */
  size?: "md" | "sm";
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Monospace, non-wrapping — for JSON/code editing. */
  code?: boolean;
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: ReactNode; ariaLabel?: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** Compact inline style (e.g. phone/desktop toggle). */
  inline?: boolean;
  className?: string;
}

export interface SwatchesProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  size?: "md" | "lg";
}
