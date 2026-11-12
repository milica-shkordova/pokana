import { useEffect, useState } from "react";
import type { EventSummary } from "@pokanito/shared";
import { Button, Dialog, Input } from "@pokanito/ui";
import { WEB_HOST } from "@/lib/api";
import { IconArchive, IconPause, IconTrash } from "./Icons";

/** What the events list is asking to confirm (null = nothing open). */
export type EventAction =
  | { kind: "unpublish"; event: EventSummary }
  | { kind: "archive"; event: EventSummary }
  | { kind: "delete"; event: EventSummary }
  | null;

interface Props {
  action: EventAction;
  onClose: () => void;
  onUnpublish: (e: EventSummary) => Promise<void>;
  onArchive: (e: EventSummary, keepOnline: boolean) => Promise<void>;
  onDelete: (e: EventSummary) => Promise<void>;
}

/**
 * The events list's confirmations (Admin · Events: row menu, archive, delete):
 * unpublish, archive (optionally keeping the link online) and permanent
 * delete (type the name to confirm). One <Dialog> per kind, so each animates
 * in and out on its own.
 */
export default function EventDialogs({ action, onClose, onUnpublish, onArchive, onDelete }: Props) {
  // The last event shown stays rendered while a dialog animates closed.
  const [last, setLast] = useState<NonNullable<EventAction> | null>(action);
  useEffect(() => {
    if (action) setLast(action);
  }, [action]);
  const [busy, setBusy] = useState(false);
  const [keepOnline, setKeepOnline] = useState(false);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (!action) return;
    setBusy(false);
    setKeepOnline(false);
    setTyped("");
  }, [action]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const ev = last?.event;
  const name = ev?.name ?? "";
  const open = (kind: NonNullable<EventAction>["kind"]) => action?.kind === kind;
  const nameMatches = typed.trim() === name.trim() && name.trim() !== "";

  const cancel = (
    <Button variant="outline" onClick={onClose} disabled={busy}>
      Cancel
    </Button>
  );

  return (
    <>
      <Dialog
        open={open("unpublish")}
        onClose={onClose}
        hideClose
        icon={<IconPause />}
        title={`Unpublish “${name}”?`}
        footer={
          <>
            {cancel}
            <Button loading={busy} onClick={() => ev && void run(() => onUnpublish(ev))}>
              Unpublish
            </Button>
          </>
        }
      >
        <div className="admin-confirm">
          <p>The invitation goes back to Draft so you can make changes privately.</p>
          <ul>
            <li>Guests with the link will see “This invitation isn’t available right now”.</li>
            <li>RSVPs already received are kept.</li>
            <li>Publish again whenever you’re ready; the link stays the same.</li>
          </ul>
        </div>
      </Dialog>

      <Dialog
        open={open("archive")}
        onClose={onClose}
        hideClose
        icon={<IconArchive />}
        title={`Archive “${name}”?`}
        footer={
          <>
            {cancel}
            <Button loading={busy} onClick={() => ev && void run(() => onArchive(ev, keepOnline))}>
              Archive
            </Button>
          </>
        }
      >
        <div className="admin-confirm">
          <p>It moves to the Archived tab and leaves your active lists.</p>
          <ul>
            <li>{keepOnline ? "The invitation link stays online (no new RSVPs)." : "The invitation link will be offline."}</li>
            <li>RSVPs, photos and settings are kept.</li>
            <li>You can restore it any time from Archived.</li>
          </ul>
          <label className="admin-confirm__option">
            <input type="checkbox" checked={keepOnline} onChange={(e) => setKeepOnline(e.target.checked)} />
            <span>
              <strong>Keep the invitation link online</strong>
              <span className="ui-muted">Guests can still open it to look back at the photos. Only hides it from your lists.</span>
            </span>
          </label>
        </div>
      </Dialog>

      <Dialog
        open={open("delete")}
        onClose={onClose}
        hideClose
        icon={<IconTrash />}
        iconTone="danger"
        title={`Delete “${name}” permanently?`}
        footer={
          <>
            {cancel}
            <Button loading={busy} disabled={!nameMatches} onClick={() => ev && void run(() => onDelete(ev))}>
              Delete permanently
            </Button>
          </>
        }
      >
        <div className="admin-confirm">
          <p>This can’t be undone.</p>
          <ul>
            <li>The invitation page and its link are removed for good.</li>
            <li>All RSVPs, uploaded photos and music are deleted.</li>
            <li>
              The link {WEB_HOST}/{ev?.slug} becomes free to reuse.
            </li>
          </ul>
          <label className="admin-confirm__type">
            <span>
              Type <code>{name}</code> to confirm
            </span>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={name}
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "Enter" && nameMatches && ev) void run(() => onDelete(ev));
              }}
            />
          </label>
          {ev && ev.rsvpCount > 0 && (
            <a className="admin-confirm__export" href={`/api/admin/events/${ev.id}/rsvps.csv`} download>
              Export the guest list first (CSV) ↓
            </a>
          )}
        </div>
      </Dialog>
    </>
  );
}
