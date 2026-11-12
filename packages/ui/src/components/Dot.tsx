import { cx } from "../cx";

export function Dot({ tone }: { tone: "ok" | "warn" | "off" }) {
  return <span className={cx("ui-dot", `ui-dot--${tone}`)} aria-hidden />;
}
