import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../cx";

export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("ui-container", className)} {...rest} />;
}

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: "cream" | "sand" | "linen" | "white";
}

/** Full-width page band with vertical rhythm; put a <Container> inside. */
export function Section({ tone = "white", className, ...rest }: SectionProps) {
  return <section className={cx("ui-section", `ui-section--${tone}`, className)} {...rest} />;
}

type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingSize = "display" | "xl" | "lg" | "page" | "md" | "sm";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: HeadingSize;
}

export function Heading({ level = 2, size = "lg", className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cx("ui-heading", `ui-heading--${size}`, className)} {...rest} />;
}

/** Small uppercase terracotta label above a section heading ("What we do"). */
export function Eyebrow({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("ui-eyebrow", className)} {...rest} />;
}

/** Small uppercase label ("WORKSPACE"). */
export function Kicker({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("ui-kicker", className)} {...rest} />;
}

/** Clay uppercase category label ("WEDDING"). */
export function CategoryLabel({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("ui-category", className)} {...rest} />;
}

export function Lede({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("ui-lede", className)} {...rest} />;
}

interface SectionHeadingProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  level?: HeadingLevel;
  size?: HeadingSize;
}

/** Eyebrow + heading + lede — the standard section intro. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "center",
  level = 2,
  size = "lg",
  className,
  ...rest
}: SectionHeadingProps) {
  return (
    <div className={cx("ui-section-heading", align === "center" && "ui-section-heading--center", className)} {...rest}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Heading level={level} size={size}>
        {title}
      </Heading>
      {lede && <Lede>{lede}</Lede>}
    </div>
  );
}

/** Admin page header: kicker + serif title, with actions on the right. */
export function PageHeader({ kicker, title, actions }: { kicker?: ReactNode; title: ReactNode; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {kicker && <Kicker>{kicker}</Kicker>}
        <Heading level={1} size="page">
          {title}
        </Heading>
      </div>
      {actions && <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>{actions}</div>}
    </div>
  );
}
