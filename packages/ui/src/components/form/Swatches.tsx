import { cx } from "../../cx";
import type { SwatchesProps } from "./types";

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
