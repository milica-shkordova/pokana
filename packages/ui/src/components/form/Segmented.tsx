import { cx } from "../../cx";
import { useSlidingIndicator } from "../../hooks/useSlidingIndicator";
import type { SegmentedProps } from "./types";

/** Segmented control (radiogroup), e.g. Live / Coming soon / Hidden. */
export function Segmented<T extends string>({ options, value, onChange, label, inline, className }: SegmentedProps<T>) {
  // The selected option's white thumb slides between options.
  const [group, thumb] = useSlidingIndicator<HTMLDivElement>('[aria-checked="true"]', [value, options.length]);
  return (
    <div ref={group} role="radiogroup" aria-label={label} className={cx("ui-segmented", inline && "ui-segmented--inline", className)}>
      {thumb && (
        <span
          className="ui-segmented__thumb"
          style={{ width: thumb.width, height: thumb.height, transform: `translate(${thumb.left}px, ${thumb.top}px)` }}
          aria-hidden
        />
      )}
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
