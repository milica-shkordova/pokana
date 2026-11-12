import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { LEAD_PIPELINE, LEAD_STAGE_LABELS, type Lead, type LeadStage } from "@pokanito/shared";
import { Button, Card, EmptyState, LeadStageBadge, Textarea, buttonClassName, cx, useToast } from "@pokanito/ui";
import AdminLayout from "@/components/AdminLayout";
import LoadState from "@/components/LoadState";
import { api, errorMessage, useResource } from "@/lib/api";
import { formatDate, timeAgo } from "@/lib/format";
import { useSession } from "@/lib/session";

const contactHref = (contact: string) => (contact.includes("@") ? `mailto:${contact}` : `tel:${contact.replace(/[^\d+]/g, "")}`);

export default function LeadsPage() {
  const router = useRouter();
  const toast = useToast();
  const { refreshStats } = useSession();
  const { data, loading, error, reload, mutate } = useResource<Lead[]>("/api/admin/leads");
  const leads = data ?? [];
  const [selId, setSelId] = useState<string | null>(null);
  const cur = leads.find((l) => l.id === selId) ?? leads[0];

  const patch = async (lead: Lead, body: Partial<Pick<Lead, "stage" | "note" | "unread">>, quiet = false) => {
    mutate((prev) => (prev ?? []).map((l) => (l.id === lead.id ? { ...l, ...body } : l)));
    try {
      const updated = await api.patch<Lead>(`/api/admin/leads/${lead.id}`, body);
      mutate((prev) => (prev ?? []).map((l) => (l.id === updated.id ? { ...updated, note: l.note } : l)));
      if (body.unread === false || body.stage) refreshStats();
      if (!quiet && body.stage) toast(`Moved to “${LEAD_STAGE_LABELS[body.stage]}”`);
    } catch (err) {
      toast(errorMessage(err), "error");
      void reload();
    }
  };

  // Opening a lead marks it read.
  useEffect(() => {
    if (cur?.unread) void patch(cur, { unread: false }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur?.id]);

  // Internal note autosave.
  const [note, setNote] = useState("");
  useEffect(() => setNote(cur?.note ?? ""), [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!cur || note === (cur.note ?? "")) return;
    const t = setTimeout(() => void patch(cur, { note: note || null }, true), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  const stageIdx = cur ? LEAD_PIPELINE.indexOf(cur.stage) : -1;
  const next: LeadStage | undefined = cur && stageIdx >= 0 ? LEAD_PIPELINE[stageIdx + 1] : cur?.stage === "lost" ? "new" : undefined;

  return (
    <AdminLayout
      kicker="From “Get in touch” & “Notify me”"
      title="Leads"
      actions={
        <a className={buttonClassName({ variant: "secondary" })} href="/api/admin/leads/export.csv" download>
          Export CSV
        </a>
      }
    >
      <LoadState loading={loading && !data} error={error} onRetry={reload}>
        {leads.length === 0 ? (
          <Card>
            <EmptyState icon="✉" title="No leads yet">
              Contact-form and “Notify me” submissions from the landing page arrive here.
            </EmptyState>
          </Card>
        ) : (
          <div className="admin-split">
            <div className="admin-lead-list" role="list" aria-label="Leads">
              {leads.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="listitem"
                  aria-current={cur?.id === l.id ? "true" : undefined}
                  className={cx("admin-lead-row", cur?.id === l.id && "admin-lead-row--on")}
                  onClick={() => setSelId(l.id)}
                >
                  <span className="admin-lead-row__top">
                    <span className={cx("admin-lead-row__name", l.unread && "admin-lead-row__name--unread")}>
                      {l.name}
                      {l.unread && <span className="ui-sr-only"> (unread)</span>}
                    </span>
                    <span className="ui-muted ui-nowrap">{timeAgo(l.createdAt)}</span>
                  </span>
                  <span className="admin-lead-row__subject">
                    {l.source === "notify-me" ? `Notify me: ${l.templateName ?? "a template"}` : l.message.split("\n")[0].slice(0, 80) || "(no message)"}
                  </span>
                  <span className="ui-row">
                    <LeadStageBadge stage={l.stage} />
                    {l.templateName && <span className="ui-badge ui-badge--outline ui-badge--sm">{l.templateName}</span>}
                  </span>
                </button>
              ))}
            </div>

            {cur && (
              <Card key={cur.id} className="admin-split__wide ui-stack--22 admin-panel-in" aria-label="Lead details">
                <div className="ui-row ui-row--between ui-row--wrap ui-row--top">
                  <div className="ui-stack--8">
                    <h2 className="admin-detail-title">{cur.name}</h2>
                    <span className="ui-muted">
                      {cur.contact} · received {timeAgo(cur.createdAt)} · {cur.source === "notify-me" ? "Notify me" : "Contact form"}
                    </span>
                  </div>
                  {cur.eventId ? (
                    <Link href={`/events/${cur.eventId}`} className={buttonClassName()}>
                      Open event
                    </Link>
                  ) : (
                    <Button onClick={() => void router.push(`/events/new?lead=${cur.id}`)}>Create event from lead</Button>
                  )}
                </div>

                <ol aria-label="Pipeline" className="admin-pipeline">
                  {LEAD_PIPELINE.map((s, i) => (
                    <li key={s} aria-current={cur.stage === s ? "step" : undefined}>
                      <span className={cx("admin-pipeline__bar", stageIdx >= 0 && i <= stageIdx && "admin-pipeline__bar--on")} />
                      <span className={cx("admin-pipeline__label", cur.stage === s && "admin-pipeline__label--on")}>{LEAD_STAGE_LABELS[s]}</span>
                    </li>
                  ))}
                </ol>
                {cur.stage === "lost" && <p className="ui-warn">Marked as lost.</p>}

                <div className="admin-facts">
                  <div>
                    <span className="ui-muted">Template of interest</span>
                    <strong>{cur.templateName ?? "Not sure yet"}</strong>
                  </div>
                  <div>
                    <span className="ui-muted">Event date</span>
                    <strong>{cur.eventDate ? (Number.isNaN(Date.parse(cur.eventDate)) ? cur.eventDate : formatDate(new Date(cur.eventDate).toISOString())) : "—"}</strong>
                  </div>
                  <div>
                    <span className="ui-muted">Guests</span>
                    <strong>{cur.guestCount ?? "—"}</strong>
                  </div>
                </div>

                <div className="ui-stack--8">
                  <span className="ui-label">Message</span>
                  <p className="admin-quote">{cur.message || <span className="ui-muted">No message.</span>}</p>
                </div>

                <div className="ui-stack--8">
                  <label htmlFor="lead-note" className="ui-label">
                    Internal note
                  </label>
                  <Textarea id="lead-note" rows={3} placeholder="Quoted price, follow-up date, anything to remember…" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>

                <div className="ui-row ui-row--wrap">
                  {next && (
                    <Button variant="secondary" onClick={() => void patch(cur, { stage: next })}>
                      {cur.stage === "lost" ? "Reopen" : "Move to next stage →"}
                    </Button>
                  )}
                  <a className={buttonClassName({ variant: "secondary" })} href={contactHref(cur.contact)}>
                    {cur.contact.includes("@") ? "Reply by email" : "Call"}
                  </a>
                  {cur.stage !== "lost" && (
                    <Button variant="danger" onClick={() => void patch(cur, { stage: "lost" })}>
                      Mark as lost
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm(`Delete the lead from ${cur.name}?`)) return;
                      try {
                        await api.delete(`/api/admin/leads/${cur.id}`);
                        mutate(leads.filter((l) => l.id !== cur.id));
                        setSelId(null);
                        refreshStats();
                      } catch (err) {
                        toast(errorMessage(err), "error");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </LoadState>
    </AdminLayout>
  );
}
