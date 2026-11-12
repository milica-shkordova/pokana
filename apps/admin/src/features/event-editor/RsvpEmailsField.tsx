import type { EventDetail } from "@pokanito/shared";
import { Button, IconMail } from "@pokanito/ui";
import type { EventEditor } from "./useEventEditor";
import { useRsvpTest } from "./useRsvpTest";

/** "Send RSVP replies to" with the test email and its result. */
export default function RsvpEmailsField({
  event,
  update,
  applyServer,
  flush,
}: {
  event: EventDetail;
  update: EventEditor["update"];
  applyServer: (e: EventDetail) => void;
  flush: () => Promise<void>;
}) {
  const { emails, changeEmails, parsed, badEmail, testing, testedTo, sendTest } = useRsvpTest(event, { update, applyServer, flush });
  return (
    <div className="ui-stack--8">
      <label htmlFor="rsvp-email" className="ui-field__label">
        Send RSVP replies to
      </label>
      <div className="ui-row ui-row--wrap">
        <div className="admin-email-input">
          <IconMail />
          <input
            id="rsvp-email"
            type="text"
            inputMode="email"
            value={emails}
            placeholder="client@example.com"
            aria-invalid={badEmail ? true : undefined}
            onChange={(e) => changeEmails(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          onClick={sendTest}
          loading={testing}
          disabled={!parsed.length || !!badEmail}
        >
          Send test email
        </Button>
      </div>
      {badEmail ? (
        <span className="ui-field__error">
          “{badEmail}” isn&apos;t a valid email
        </span>
      ) : testedTo ? (
        <span className="ui-ok">
          Test RSVP sent to {testedTo.join(", ")}, ask the client to check
          spam too.
        </span>
      ) : event.rsvpTestedAt && event.rsvpEmails.length ? (
        <span className="ui-ok">
          Tested ✓ — replies will arrive at these addresses.
        </span>
      ) : (
        <span className="ui-muted">
          Each reply arrives as one email with the guest’s name,
          attendance, number of guests and menu choice. Add more addresses
          separated by commas.
        </span>
      )}
    </div>
  );
}
