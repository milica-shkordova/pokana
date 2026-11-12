import type { HTMLAttributes } from "react";
import { cx } from "../cx";

export function Table({
  className,
  ...rest
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="ui-table-wrap">
      <table className={cx("ui-table", className)} {...rest} />
    </div>
  );
}
