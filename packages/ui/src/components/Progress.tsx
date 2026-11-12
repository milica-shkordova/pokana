import { clamp } from "@pokanito/shared";

export function Progress({ value, label }: { value: number; label: string }) {
  const pct = clamp(value, 0, 100);
  return (
    <span
      className="ui-progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className="ui-progress__bar" style={{ width: `${pct}%` }} />
    </span>
  );
}
