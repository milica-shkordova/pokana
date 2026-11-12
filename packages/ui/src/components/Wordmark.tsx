import { cx } from "../cx";

export interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  variant?: "logo" | "wordmark" | "icon";
  tone?: "light" | "dark";
  className?: string;
  text?: string;
}

/**
 * The Pokanito logo. Each app serves the SVGs from its own /public/brand
 * (sources: packages/ui/brand). `variant`: full logo (the lockup: the P mark,
 * scaled to the letters' height, beside the "pokanito." wordmark), wordmark
 * only, or the P mark alone. `tone="dark"` picks the versions with a cream wordmark for
 * plum/dark backgrounds. `text` is the accessible name.
 */
export function Wordmark({
  size = "md",
  variant = "logo",
  tone = "light",
  className,
  text = "Pokanito",
}: WordmarkProps) {
  const base = variant === "logo" ? "lockup" : variant;
  const file = variant === "icon" ? "mark" : tone === "dark" ? `${base}-on-dark` : base;
  return (
    <img
      className={cx(
        "ui-wordmark",
        `ui-wordmark--${size}`,
        `ui-wordmark--${variant}`,
        className,
      )}
      src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/pokanito-${file}.svg`}
      alt={text}
    />
  );
}
