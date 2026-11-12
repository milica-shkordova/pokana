import { timeAgo, type Lead } from "@pokanito/shared";
import { LeadStageBadge, cx } from "@pokanito/ui";
import { leadSubject } from "./utils";

export default function LeadList({ leads, currentId, onSelect }: { leads: Lead[]; currentId: string | undefined; onSelect: (id: string) => void }) {
  return (
    <div className="admin-lead-list" role="list" aria-label="Leads">
      {leads.map((l) => (
        <button
          key={l.id}
          type="button"
          role="listitem"
          aria-current={currentId === l.id ? "true" : undefined}
          className={cx("admin-lead-row", currentId === l.id && "admin-lead-row--on")}
          onClick={() => onSelect(l.id)}
        >
          <span className="admin-lead-row__top">
            <span className={cx("admin-lead-row__name", l.unread && "admin-lead-row__name--unread")}>
              {l.name}
              {l.unread && <span className="ui-sr-only"> (unread)</span>}
            </span>
            <span className="ui-muted ui-nowrap">{timeAgo(l.createdAt)}</span>
          </span>
          <span className="admin-lead-row__subject">{leadSubject(l)}</span>
          <span className="ui-row">
            <LeadStageBadge stage={l.stage} />
            {l.templateName && <span className="ui-badge ui-badge--outline ui-badge--sm">{l.templateName}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
