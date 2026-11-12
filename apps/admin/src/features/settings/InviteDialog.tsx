import type { UserRole } from "@pokanito/shared";
import { Alert, Button, Dialog, Field, Input, IssueList, Select } from "@pokanito/ui";
import type { TeamState } from "./useTeam";

/** Invite form, then the sent link (with a warning if the email failed). */
export default function InviteDialog({ team }: { team: TeamState }) {
  const { inviting, closeInvite, link, form, busy, error, invite, copyLink } = team;
  const { email, setEmail, name, setName, role, setRole } = form;
  return (
    <Dialog
      open={inviting}
      onClose={closeInvite}
      title={link ? "Invite sent" : "Invite a team member"}
    >
      {link ? (
        <div className="ui-stack">
          {link.emailError ? (
            <Alert tone="warning">
              The email couldn&apos;t be sent ({link.emailError}). Share this
              link with them directly:
            </Alert>
          ) : (
            <p>
              We emailed an invite to {email}. You can also share the link
              directly — it works for 7 days:
            </p>
          )}
          <Input
            readOnly
            value={link.url}
            onFocus={(e) => e.target.select()}
            aria-label="Invite link"
          />
          <div className="ui-row ui-row--end">
            <Button
              variant="secondary"
              onClick={() => copyLink(link.url)}
            >
              Copy link
            </Button>
            <Button onClick={closeInvite}>Done</Button>
          </div>
        </div>
      ) : (
        <form className="ui-stack" onSubmit={invite}>
          <IssueList error={error} />
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Name (optional)">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Role" hint="Owners can also manage the team.">
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </Select>
          </Field>
          <div className="ui-row ui-row--end">
            <Button variant="secondary" onClick={closeInvite}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Send invite
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
