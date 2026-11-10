import { useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import {
  EVENT_STATUS_LABELS,
  LEAD_STAGE_LABELS,
  type EventStatus,
  type LeadStage,
  type TemplateStatus,
} from "@momentelo/shared";
import { cx } from "../cx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "compact" | "default";
}

export function Card({ padding = "default", className, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        "ui-card",
        padding === "default" && "ui-card--padded",
        padding === "compact" && "ui-card--compact",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="ui-card__header">
      <div className="ui-card__heading">
        <h2 className="ui-card__title">{title}</h2>
        {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

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

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: "sm" | "md";
  caps?: boolean;
}

export function Badge({
  tone = "draft",
  size = "md",
  caps,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(
        "ui-badge",
        `ui-badge--${tone}`,
        size === "sm" && "ui-badge--sm",
        caps && "ui-badge--caps",
        className,
      )}
      {...rest}
    />
  );
}

export const eventStatusTone: Record<EventStatus, BadgeTone> = {
  live: "live",
  draft: "draft",
  "in-review": "review",
  past: "past",
  archived: "past",
};

export function EventStatusBadge({
  status,
  size,
}: {
  status: EventStatus;
  size?: "sm" | "md";
}) {
  return (
    <Badge tone={eventStatusTone[status]} size={size}>
      {EVENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export const templateStatusTone: Record<TemplateStatus, BadgeTone> = {
  live: "live",
  "coming-soon": "soon",
  hidden: "past",
  draft: "draft",
};
export const TEMPLATE_STATUS_LABELS: Record<TemplateStatus, string> = {
  live: "Live",
  "coming-soon": "Coming soon",
  hidden: "Hidden",
  draft: "Draft",
};

export function TemplateStatusBadge({
  status,
  size,
}: {
  status: TemplateStatus;
  size?: "sm" | "md";
}) {
  return (
    <Badge tone={templateStatusTone[status]} size={size}>
      {TEMPLATE_STATUS_LABELS[status]}
    </Badge>
  );
}

export const leadStageTone: Record<LeadStage, BadgeTone> = {
  new: "new",
  contacted: "review",
  "preview-sent": "soon",
  won: "live",
  live: "info",
  lost: "past",
};

export function LeadStageBadge({
  stage,
  size = "sm",
}: {
  stage: LeadStage;
  size?: "sm" | "md";
}) {
  return (
    <Badge tone={leadStageTone[stage]} size={size} style={{ fontWeight: 700 }}>
      {LEAD_STAGE_LABELS[stage]}
    </Badge>
  );
}

export type AlertTone = "info" | "success" | "warning" | "danger";

export function Alert({
  tone = "info",
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cx("ui-alert", `ui-alert--${tone}`, className)}
      {...rest}
    />
  );
}

interface TabsProps<T extends string> {
  items: readonly { value: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  /** plain: admin filter tabs · outline: landing category pills · chips: white bordered pills. */
  variant?: "plain" | "outline" | "chips";
  align?: "left" | "center";
  /** The active pill glides between tabs instead of jumping (admin). */
  sliding?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = "plain",
  align = "left",
  sliding = false,
  className,
  ...rest
}: TabsProps<T>) {
  const list = useRef<HTMLDivElement>(null);
  const [glider, setGlider] = useState<CSSProperties | null>(null);
  // Sliding pill: measured from the active tab (kept in sync on resize).
  useLayoutEffect(() => {
    if (!sliding) return;
    const el = list.current;
    if (!el) return;
    const place = () => {
      const tab = el.querySelector<HTMLElement>(".ui-tabs__tab--active");
      setGlider(
        tab
          ? { width: tab.offsetWidth, height: tab.offsetHeight, transform: `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)` }
          : null,
      );
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sliding, value, items.length]);

  return (
    <div
      ref={list}
      role="tablist"
      className={cx(
        "ui-tabs",
        variant !== "plain" && `ui-tabs--${variant}`,
        align === "center" && "ui-tabs--center",
        sliding && "ui-tabs--sliding",
        className,
      )}
      {...rest}
    >
      {sliding && glider && <span className="ui-tabs__glider" style={glider} aria-hidden />}
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          className={cx(
            "ui-tabs__tab",
            item.value === value && "ui-tabs__tab--active",
          )}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="ui-tabs__count">{item.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

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

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  hintTone?: "default" | "good" | "warn";
}

export function Stat({ label, value, hint, hintTone = "default" }: StatProps) {
  return (
    <Card padding="none" className="ui-stat">
      <span className="ui-stat__label">{label}</span>
      <span className="ui-stat__value">{value}</span>
      {hint && (
        <span
          className={cx(
            "ui-stat__hint",
            hintTone !== "default" && `ui-stat__hint--${hintTone}`,
          )}
        >
          {hint}
        </span>
      )}
    </Card>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  icon = "✦",
  title,
  children,
  action,
}: EmptyStateProps) {
  return (
    <div className="ui-empty">
      <div className="ui-empty__icon" aria-hidden>
        {icon}
      </div>
      <p className="ui-empty__title">{title}</p>
      {children && <p>{children}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  );
}

/**
 * The Momentelo logo. Each app serves the PNGs from its own /public/brand
 * (sources: packages/ui/brand). `variant`: full logo (icon + wordmark),
 * wordmark only, or the icon alone. `text` is the accessible name.
 */
export function Wordmark({
  size = "md",
  variant = "logo",
  className,
  text = "Momentelo",
}: {
  size?: "sm" | "md" | "lg";
  variant?: "logo" | "wordmark" | "icon";
  className?: string;
  text?: string;
}) {
  return (
    <img
      className={cx(
        "ui-wordmark",
        `ui-wordmark--${size}`,
        `ui-wordmark--${variant}`,
        className,
      )}
      src={`/brand/momentelo-${variant}.png`}
      alt={text}
    />
  );
}

/** @deprecated Use <Wordmark />. Kept as an alias. */
export const Logo = Wordmark;

export function Avatar({
  name,
  size = "md",
  pending,
}: {
  name: string;
  size?: "md" | "lg";
  pending?: boolean;
}) {
  const initials =
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";
  return (
    <span
      className={cx(
        "ui-avatar",
        size === "lg" && "ui-avatar--lg",
        pending && "ui-avatar--pending",
      )}
      aria-hidden
    >
      {pending ? "?" : initials}
    </span>
  );
}

export function Dot({ tone }: { tone: "ok" | "warn" | "off" }) {
  return <span className={cx("ui-dot", `ui-dot--${tone}`)} aria-hidden />;
}

export function Progress({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
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
