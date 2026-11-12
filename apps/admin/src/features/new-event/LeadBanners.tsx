import Link from "next/link";
import { formatDate, guessDate, type Lead } from "@pokanito/shared";
import { IconChat } from "@pokanito/ui";

/** "For lead …" when creating from a lead, or a suggestion to start from one. */
export default function LeadBanners({ lead, suggestion }: { lead: Lead | null; suggestion: Lead | null | undefined }) {
  return (
    <>
      {lead && (
        <div className="admin-lead-banner">
          <span className="admin-lead-banner__icon">
            <IconChat />
          </span>
          <span>
            <strong>For lead {lead.name}</strong>
            <span className="ui-muted">
              {lead.contact}
              {lead.templateName ? ` · interested in ${lead.templateName}` : ""}. Their details fill the new draft.
            </span>
          </span>
        </div>
      )}
      {suggestion && (
        <Link href={`/events/new?lead=${suggestion.id}`} className="admin-lead-banner admin-lead-banner--link">
          <span className="admin-lead-banner__icon">
            <IconChat />
          </span>
          <span>
            <strong>Starting from a lead?</strong>
            <span className="ui-muted">
              {suggestion.name} asked about {suggestion.templateName ?? "a template"}
              {suggestion.eventDate ? ` for ${formatDate(guessDate(suggestion.eventDate) ?? suggestion.eventDate)}` : ""}. Use
              these details →
            </span>
          </span>
        </Link>
      )}
    </>
  );
}
