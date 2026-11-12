import { cx } from "../cx";
import { initials } from "../utils/initials";

export function Avatar({
  name,
  size = "md",
  pending,
}: {
  name: string;
  size?: "md" | "lg";
  pending?: boolean;
}) {
  return (
    <span
      className={cx(
        "ui-avatar",
        size === "lg" && "ui-avatar--lg",
        pending && "ui-avatar--pending",
      )}
      aria-hidden
    >
      {pending ? "?" : initials(name)}
    </span>
  );
}
