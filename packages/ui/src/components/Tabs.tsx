import type { ReactNode } from "react";
import { cx } from "../cx";
import { useSlidingIndicator } from "../hooks/useSlidingIndicator";

export interface TabsProps<T extends string> {
  items: readonly { value: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  /** plain: admin filter tabs · outline: landing category pills · chips: white bordered pills. */
  variant?: "plain" | "outline" | "chips";
  align?: "left" | "center";
  /** The active pill glides between tabs instead of jumping (admin). */
  sliding?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = "plain",
  align = "left",
  sliding = false,
  className,
  ...rest
}: TabsProps<T>) {
  // Sliding pill: measured from the active tab (kept in sync on resize).
  const [list, glider] = useSlidingIndicator<HTMLDivElement>(".ui-tabs__tab--active", [value, items.length], sliding);

  return (
    <div
      ref={list}
      role="tablist"
      className={cx(
        "ui-tabs",
        variant !== "plain" && `ui-tabs--${variant}`,
        align === "center" && "ui-tabs--center",
        sliding && "ui-tabs--sliding",
        className,
      )}
      {...rest}
    >
      {sliding && glider && (
        <span
          className="ui-tabs__glider"
          style={{ width: glider.width, height: glider.height, transform: `translate(${glider.left}px, ${glider.top}px)` }}
          aria-hidden
        />
      )}
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          className={cx(
            "ui-tabs__tab",
            item.value === value && "ui-tabs__tab--active",
          )}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="ui-tabs__count">{item.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
