import type { ReactNode } from "react";

export interface EmptyStateProps {
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
