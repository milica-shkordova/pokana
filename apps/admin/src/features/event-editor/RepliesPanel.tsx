import { formatDateTime, type EventDetail } from "@pokanito/shared";
import {
  Badge,
  Button,
  EmptyState,
  Stat,
  Table,
  buttonClassName,
  LoadState,
} from "@pokanito/ui";
import { EditorCard } from "./fields";
import { useReplies } from "./useReplies";

export default function RepliesPanel({ event }: { event: EventDetail }) {
  const { data, loading, error, reload, rsvps, attending, guests, menus, failed, remove, resend } = useReplies(event);

  if (event.isDemo) {
    return (
      <EditorCard title="Replies">
        <p className="ui-muted">This is a gallery demo — replies are accepted but not stored or emailed.</p>
      </EditorCard>
    );
  }

  return (
    <EditorCard
      title="Replies"
      aside={
        <div className="ui-row">
          <Button size="sm" variant="ghost" onClick={reload}>
            Refresh
          </Button>
          <a className={buttonClassName({ size: "sm", variant: "secondary" })} href={`/api/admin/events/${event.id}/rsvps.csv`} download>
            Export CSV
          </a>
        </div>
      }
    >
      <LoadState loading={loading && !data} error={error} onRetry={reload}>
        <div className="admin-stats admin-stats--compact">
          <Stat label="Replies" value={rsvps.length} />
          <Stat label="Coming" value={guests} hint={event.expectedGuests ? `of ${event.expectedGuests} expected` : `${attending.length} replies`} />
          <Stat label="Can't come" value={rsvps.length - attending.length} />
          {Object.keys(menus).length > 0 && (
            <Stat
              label="Menus"
              value={Object.values(menus).reduce((a, b) => a + b, 0)}
              hint={Object.entries(menus)
                .map(([m, n]) => `${m}: ${n}`)
                .join(" · ")}
            />
          )}
        </div>
        {failed > 0 && (
          <p className="ui-warn">
            {failed} reply email{failed === 1 ? "" : "s"} couldn&apos;t be delivered — check the address in Basics, then press “Resend”.
          </p>
        )}
        {rsvps.length === 0 ? (
          <EmptyState icon="✉" title="No replies yet">
            {event.status === "live" ? "Share the link — replies will appear here and in the client's inbox." : "Publish the invitation to start collecting replies."}
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Reply</th>
                <th>Details</th>
                <th>Email</th>
                <th>
                  <span className="ui-sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <div className="ui-muted">{formatDateTime(r.createdAt)}</div>
                  </td>
                  <td>{r.attending ? <Badge tone="live">Coming · {r.totalGuests}</Badge> : <Badge tone="past">Can&apos;t come</Badge>}</td>
                  <td className="admin-details">
                    {r.guests.length > 0 && <div>{r.guests.map((g) => (g.menu ? `${g.name} (${g.menu})` : g.name)).join(", ")}</div>}
                    {(r.adults != null || r.children != null) && (
                      <div>
                        Adults {r.adults ?? 0} · Children {r.children ?? 0}
                      </div>
                    )}
                    {r.extra.company && <div>{r.extra.company}</div>}
                    {r.extra.email && <div>{r.extra.email}</div>}
                    {r.extra.dinner !== undefined && <div>Dinner: {r.extra.dinner ? "yes" : "no"}</div>}
                    {r.extra.plusOne !== undefined && <div>Plus one: {r.extra.plusOne ? "yes" : "no"}</div>}
                    {r.allergies && <div>Allergies: {r.allergies}</div>}
                    {r.message && <div className="ui-muted">„{r.message}“</div>}
                  </td>
                  <td>
                    {r.emailedAt ? (
                      <span className="ui-ok">Sent</span>
                    ) : r.emailError ? (
                      <span className="ui-error" title={r.emailError}>
                        Failed
                      </span>
                    ) : (
                      <span className="ui-muted">Sending…</span>
                    )}
                  </td>
                  <td className="ui-num">
                    <div className="ui-row ui-row--end">
                      {!r.emailedAt && r.emailError && (
                        <Button size="sm" variant="secondary" onClick={() => resend(r)}>
                          Resend
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => remove(r)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </LoadState>
    </EditorCard>
  );
}
