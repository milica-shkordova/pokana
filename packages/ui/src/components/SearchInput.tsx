import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../cx";
import { IconSearch } from "./icons/LineIcons";

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Accessible name (visually hidden). */
  label: ReactNode;
  /** Class on the bordered box (the <label>). */
  className?: string;
  icon?: ReactNode;
}

/** Search field: icon + borderless input in one bordered box. */
export function SearchInput({ label, className, icon = <IconSearch />, ...rest }: SearchInputProps) {
  return (
    <label className={cx("ui-search", className)}>
      {icon}
      <span className="ui-sr-only">{label}</span>
      <input type="search" {...rest} />
    </label>
  );
}
