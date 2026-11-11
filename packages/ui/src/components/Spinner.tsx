import { cx } from "../cx";

export function Spinner({ size = "md", label = "Loading" }: { size?: "md" | "lg"; label?: string }) {
  return (
    <span className={cx("ui-spinner", size === "lg" && "ui-spinner--lg")} role="status" aria-label={label} />
  );
}
