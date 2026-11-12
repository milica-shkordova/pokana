import Link from "next/link";
import { contactHref, LEAD_PIPELINE, LEAD_STAGE_LABELS, timeAgo, type Lead, type LeadStage } from "@pokanito/shared";
import { Button, Card, Textarea, buttonClassName, cx } from "@pokanito/ui";
import { leadEventDate } from "./utils";

export default function LeadDetail({
  lead: cur,
  stageIdx,
  next,
  note,
  onNote,
  onStage,
  onCreateEvent,
  onDelete,
}: {
  lead: Lead;
  stageIdx: number;
  next: LeadStage | undefined;
  note: string;
  onNote: (v: string) => void;
  onStage: (stage: LeadStage) => void;
  onCreateEvent: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="admin-split__wide ui-stack--22 admin-panel-in" aria-label="Lead details">
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
          <Button onClick={onCreateEvent}>Create event from lead</Button>
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
          <strong>{leadEventDate(cur)}</strong>
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
        <Textarea id="lead-note" rows={3} placeholder="Quoted price, follow-up date, anything to remember…" value={note} onChange={(e) => onNote(e.target.value)} />
      </div>

      <div className="ui-row ui-row--wrap">
        {next && (
          <Button variant="secondary" onClick={() => onStage(next)}>
            {cur.stage === "lost" ? "Reopen" : "Move to next stage →"}
          </Button>
        )}
        <a className={buttonClassName({ variant: "secondary" })} href={contactHref(cur.contact)}>
          {cur.contact.includes("@") ? "Reply by email" : "Call"}
        </a>
        {cur.stage !== "lost" && (
          <Button variant="danger" onClick={() => onStage("lost")}>
            Mark as lost
          </Button>
        )}
        <Button variant="ghost" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
