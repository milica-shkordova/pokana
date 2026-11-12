import type { TeamMember } from "@pokanito/shared";
import { Avatar, Badge, Button, Select } from "@pokanito/ui";

export default function TeamMemberRow({
  member: m,
  isOwner,
  meId,
  onRole,
  onResend,
  onRemove,
}: {
  member: TeamMember;
  isOwner: boolean;
  meId?: string;
  onRole: (m: TeamMember, role: string) => void;
  onResend: (m: TeamMember) => void;
  onRemove: (m: TeamMember) => void;
}) {
  const pending = !m.acceptedAt;
  return (
    <li>
      <Avatar name={m.name ?? m.email} size="lg" pending={pending} />
      <div className="admin-team__who">
        <span className="admin-team__name">
          {m.name ?? m.email}
          {m.id === meId && (
            <span className="ui-muted"> (you)</span>
          )}
        </span>
        <span className="ui-muted">
          {pending ? `${m.email} · invite pending` : m.email}
        </span>
      </div>
      {isOwner && m.id !== meId ? (
        <>
          <label>
            <span className="ui-sr-only">Role for {m.email}</span>
            <Select
              size="sm"
              value={m.role}
              onChange={(e) => onRole(m, e.target.value)}
            >
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </Select>
          </label>
          {pending && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onResend(m)}
            >
              Resend
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => onRemove(m)}
          >
            Remove
          </Button>
        </>
      ) : (
        <Badge tone="draft">
          {m.role === "owner" ? "Owner" : "Editor"}
        </Badge>
      )}
    </li>
  );
}
