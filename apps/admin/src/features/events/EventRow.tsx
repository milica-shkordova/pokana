import Link from "next/link";
import { CATEGORY_LABELS, eventUrl, formatDate, type EventSummary } from "@pokanito/shared";
import { EventStatusBadge, Menu, type MenuItem } from "@pokanito/ui";
import { WEB_HOST, WEB_URL } from "@/lib/api";
import { toneFor } from "@/lib/format";
import { rsvpCell } from "./utils";

export default function EventRow({ event: e, menu }: { event: EventSummary; menu: MenuItem[] }) {
  return (
    <tr>
      <td>
        <div className="admin-event-cell">
          {e.thumbUrl ? (
            <img className="admin-thumb" src={e.thumbUrl} alt="" />
          ) : (
            <span className="admin-thumb admin-thumb--initial" style={{ background: toneFor(e.id) }} aria-hidden>
              {e.name.charAt(0)}
            </span>
          )}
          <div className="admin-event-cell__text">
            <Link href={`/events/${e.id}`} className="admin-event-cell__name">
              {e.name}
            </Link>
            <span className="ui-muted">{e.clientName || "—"}</span>
          </div>
        </div>
      </td>
      <td>
        {e.templateName}
        <div className="ui-muted">{e.category ? CATEGORY_LABELS[e.category].one : ""}</div>
      </td>
      <td>{formatDate(e.eventDate)}</td>
      <td>
        <EventStatusBadge status={e.status} />
        {e.status === "archived" && e.archivedOnline && <div className="ui-muted admin-small">Link still online</div>}
      </td>
      <td>
        <a className="admin-link-muted" href={eventUrl(WEB_URL, e.slug)} target="_blank" rel="noreferrer">
          {WEB_HOST}/{e.slug}
        </a>
      </td>
      <td className="ui-num">{rsvpCell(e)}</td>
      <td className="ui-num">
        <Menu label={`Actions for ${e.name}`} items={menu} />
      </td>
    </tr>
  );
}
