import { Button, Card, CardHeader, LoadState } from "@pokanito/ui";
import InviteDialog from "./InviteDialog";
import TeamMemberRow from "./TeamMemberRow";
import { useTeam } from "./useTeam";

export default function TeamSection({ isOwner, meId }: { isOwner: boolean; meId?: string }) {
  const t = useTeam();
  const { team } = t;

  return (
    <Card id="team" className="ui-stack">
      <CardHeader
        title="Team"
        subtitle="People who can log in to this admin."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={t.openInvite}
            disabled={!isOwner}
            title={isOwner ? undefined : "Only owners can invite"}
          >
            + Invite
          </Button>
        }
      />
      <LoadState
        loading={team.loading && !team.data}
        error={team.error}
        onRetry={team.reload}
      >
        <ul className="admin-team">
          {team.data?.map((m) => (
            <TeamMemberRow
              key={m.id}
              member={m}
              isOwner={isOwner}
              meId={meId}
              onRole={t.changeRole}
              onResend={t.resend}
              onRemove={t.remove}
            />
          ))}
        </ul>
      </LoadState>

      <InviteDialog team={t} />
    </Card>
  );
}
