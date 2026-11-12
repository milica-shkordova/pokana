import { useState } from "react";
import type { TeamMember, UserRole } from "@pokanito/shared";
import { useToast, copyText, errorMessage } from "@pokanito/ui";
import { api, useResource } from "@/lib/api";
import type { InviteLink } from "./types";

/** Team list plus the invite dialog and per-member actions (role, resend, remove). */
export function useTeam() {
  const toast = useToast();
  const team = useResource<TeamMember[]>("/api/admin/team");
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [link, setLink] = useState<InviteLink | null>(null);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{
        member: TeamMember;
        link: string;
        emailError: string | null;
      }>("/api/admin/team", { email, name, role });
      setLink({ url: res.link, emailError: res.emailError });
      void team.reload();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const closeInvite = () => {
    setInviting(false);
    setLink(null);
    setEmail("");
    setName("");
    setRole("editor");
    setError(null);
  };

  const act = async (fn: () => Promise<unknown>, done: string) => {
    try {
      await fn();
      toast(done);
      void team.reload();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  const changeRole = (m: TeamMember, value: string) =>
    void act(
      () =>
        api.patch(`/api/admin/team/${m.id}`, {
          role: value,
        }),
      "Role updated",
    );

  const resend = (m: TeamMember) =>
    void act(async () => {
      const res = await api.post<{
        link: string;
        emailError: string | null;
      }>(`/api/admin/team/${m.id}/resend`);
      setLink({
        url: res.link,
        emailError: res.emailError,
      });
      setInviting(true);
      setEmail(m.email);
    }, "Invite sent again");

  const remove = (m: TeamMember) =>
    confirm(`Remove ${m.email} from the team? They lose access immediately.`) &&
    void act(() => api.delete(`/api/admin/team/${m.id}`), "Removed");

  const copyLink = (url: string) => void copyText(url).then((ok) => toast(ok ? "Link copied" : "Couldn't copy"));

  return {
    team,
    inviting,
    openInvite: () => setInviting(true),
    closeInvite,
    form: { email, setEmail, name, setName, role, setRole },
    busy,
    error,
    link,
    invite,
    changeRole,
    resend,
    remove,
    copyLink,
  };
}

export type TeamState = ReturnType<typeof useTeam>;
