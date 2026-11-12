import type { HTMLAttributes } from "react";

export type BadgeTone =
  | "live"
  | "draft"
  | "review"
  | "soon"
  | "past"
  | "new"
  | "info"
  | "danger"
  | "clay"
  | "ink"
  | "outline";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  caps?: boolean;
}
