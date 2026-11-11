import { useEffect, useState } from "react";
import {
  type MediaItem,
  type PublicSettings,
  type Settings,
  type TeamMember,
  type UserRole,
} from "@momentelo/shared";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Dialog,
  Field,
  FormGrid,
  Input,
  Select,
  SwitchRow,
  useToast,
  Wordmark,
} from "@momentelo/ui";
import AdminLayout from "@/components/AdminLayout";
import LoadState, { IssueList } from "@/components/LoadState";
import { UploadButton } from "@/components/MediaPicker";
import { api, copyText, errorMessage, useResource } from "@/lib/api";
import { useSession } from "@/lib/session";
import { useScrollSpy } from "@/lib/useScrollSpy";

const SECTIONS = [
  { id: "business", label: "Business profile" },
  { id: "rsvp", label: "RSVP emails" },
  { id: "links", label: "Links & publishing" },
  { id: "defaults", label: "Invitation defaults" },
  { id: "team", label: "Team" },
  { id: "account", label: "Your account" },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

const fillSubject = (t: string, guest: string, ev: string) =>
  t
    .replace(/\{гостин\}|\{guest\}/g, guest)
    .replace(/\{настан\}|\{event\}/g, ev);

export default function SettingsPage() {
  const toast = useToast();
  const { user } = useSession();
  const remote = useResource<Settings>("/api/admin/settings");
  const [form, setForm] = useState<Settings | null>(null);
  const [menuText, setMenuText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  // The admin settings only store the logo media id; the public settings
  // resolve it to an image URL. A freshly uploaded logo previews from upload.
  const publicSettings = useResource<PublicSettings>("/api/public/settings");
  const [uploadedLogo, setUploadedLogo] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (remote.data) {
      setForm(remote.data);
      setMenuText(remote.data.defaultMenuOptions.join(", "));
    }
  }, [remote.data]);

  // Highlight the section in view (the last ones too, at the bottom).
  const [active, selectSection] = useScrollSpy(SECTION_IDS, { enabled: form !== null });

  const logoSrc = !form?.logoMediaId
    ? null
    : uploadedLogo?.id === form.logoMediaId
      ? uploadedLogo.thumbUrl
      : (publicSettings.data?.logoUrl ?? null);

  const dirty =
    !!form &&
    !!remote.data &&
    (JSON.stringify(form) !== JSON.stringify(remote.data) ||
      menuText !== remote.data.defaultMenuOptions.join(", "));
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const body: Settings = {
        ...form,
        defaultMenuOptions: menuText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      remote.mutate(await api.put<Settings>("/api/admin/settings", body));
      toast("Settings saved");
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      kicker="Workspace"
      title="Settings"
      actions={
        <Button onClick={save} loading={saving} disabled={!dirty}>
          Save changes
        </Button>
      }
    >
      <LoadState
        loading={!form && !remote.error}
        error={remote.error}
        onRetry={remote.reload}
      >
        {form && (
          <div className="admin-settings">
            <nav aria-label="Settings sections" className="admin-settings__nav">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => selectSection(s.id)}
                  className={
                    active === s.id
                      ? "admin-settings__link admin-settings__link--on"
                      : "admin-settings__link"
                  }
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <div className="admin-settings__body">
              <IssueList error={error} />

              <Card id="business" className="admin-stack">
                <CardHeader
                  title="Business profile"
                  subtitle="Shown on the landing page, in emails and in the small “Made with Momentelo” footer."
                />
                <div className="admin-logo">
                  <div className="admin-logo__tile">
                    {logoSrc ? (
                      <img src={logoSrc} alt="Your logo" />
                    ) : (
                      <Wordmark variant="icon" />
                    )}
                  </div>
                  <UploadButton
                    eventId={null}
                    multiple={false}
                    label={form.logoMediaId ? "Change logo" : "Upload logo"}
                    onUploaded={(items) => {
                      if (!items[0]) return;
                      setUploadedLogo(items[0]);
                      set("logoMediaId", items[0].id);
                    }}
                  />
                  {form.logoMediaId && (
                    <Button
                      variant="ghost"
                      onClick={() => set("logoMediaId", null)}
                    >
                      Use the Momentelo logo
                    </Button>
                  )}
                </div>
                <FormGrid>
                  <Field label="Business name">
                    <Input
                      value={form.businessName}
                      onChange={(e) => set("businessName", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Contact email"
                    hint="Leads and RSVP copies are sent here"
                  >
                    <Input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => set("contactEmail", e.target.value)}
                    />
                  </Field>
                  <Field label="Phone / Viber">
                    <Input
                      placeholder="+389 …"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </Field>
                  <Field label="Instagram">
                    <Input
                      placeholder="@momentelo.mk"
                      value={form.instagram}
                      onChange={(e) => set("instagram", e.target.value)}
                    />
                  </Field>
                </FormGrid>
              </Card>

              <Card id="rsvp" className="admin-stack">
                <CardHeader
                  title="RSVP emails"
                  subtitle="How every reply email looks. The address it goes to is set per event in the editor."
                />
                <FormGrid>
                  <Field label="Sender name">
                    <Input
                      value={form.senderName}
                      onChange={(e) => set("senderName", e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Sent from"
                    hint="Must be on a domain verified in Resend"
                  >
                    <Input
                      type="email"
                      value={form.fromAddress}
                      onChange={(e) => set("fromAddress", e.target.value)}
                    />
                  </Field>
                </FormGrid>
                <Field
                  label="Subject line"
                  hint="{гостин} = guest name, {настан} = event name"
                >
                  <Input
                    value={form.subjectTemplate}
                    onChange={(e) => set("subjectTemplate", e.target.value)}
                  />
                </Field>
                <div className="admin-email-preview">
                  <div className="admin-email-preview__bar">Preview</div>
                  <div className="admin-email-preview__body">
                    <b>
                      {fillSubject(
                        form.subjectTemplate,
                        "Јована Петрова",
                        "Ана & Марко",
                      )}
                    </b>
                    <span>
                      Доаѓа: <b>Да</b> · Гости: <b>2</b>
                    </span>
                    <span>
                      Мени: {(menuText.split(",")[0] || "Месо").trim()},{" "}
                      {(menuText.split(",")[2] || "Вегетаријанско").trim()}
                    </span>
                    <span className="admin-muted">Порака: „Едвај чекаме!“</span>
                  </div>
                </div>
                <SwitchRow
                  label="Send me a copy"
                  hint={`Every RSVP also goes to ${form.contactEmail}, so you can help if a client misses one.`}
                  checked={form.ccOwnerOnRsvp}
                  onChange={(v) => set("ccOwnerOnRsvp", v)}
                />
                <SwitchRow
                  label="Daily summary for clients"
                  hint="One email a day with totals, instead of one per reply."
                  checked={form.clientDailyDigest}
                  onChange={(v) => set("clientDailyDigest", v)}
                />
              </Card>

              <Card id="links" className="admin-stack">
                <CardHeader
                  title="Links & publishing"
                  subtitle="Where invitations live and what happens after the event."
                />
                <FormGrid>
                  <Field label="Invitation domain">
                    <Input
                      value={form.domain}
                      onChange={(e) => set("domain", e.target.value)}
                    />
                  </Field>
                  <Field label="Keep online after the event">
                    <Select
                      value={String(form.keepOnlineMonths)}
                      onChange={(e) =>
                        set("keepOnlineMonths", Number(e.target.value))
                      }
                    >
                      {[3, 6, 12].map((m) => (
                        <option key={m} value={m}>
                          {m} months
                        </option>
                      ))}
                      <option value="0">Forever</option>
                    </Select>
                  </Field>
                </FormGrid>
                <SwitchRow
                  label="Hide invitations from Google"
                  hint="Only people with the link can find them."
                  checked={form.defaultNoindex}
                  onChange={(v) => set("defaultNoindex", v)}
                />
                <SwitchRow
                  label="Ask for a password by default"
                  hint="New events get a short access code that guests type before the invitation opens."
                  checked={form.defaultPassword}
                  onChange={(v) => set("defaultPassword", v)}
                />
              </Card>

              <Card id="defaults" className="admin-stack">
                <CardHeader
                  title="Invitation defaults"
                  subtitle="Pre-filled on every new event. You can still change them per event."
                />
                <FormGrid>
                  <Field label="Language">
                    <Select
                      value={form.defaultLanguage}
                      onChange={(e) =>
                        set(
                          "defaultLanguage",
                          e.target.value as Settings["defaultLanguage"],
                        )
                      }
                    >
                      <option value="mk">Македонски</option>
                      <option value="en">English</option>
                      <option value="both">Both (toggle)</option>
                    </Select>
                  </Field>
                  <Field label="RSVP deadline">
                    <Select
                      value={String(form.defaultRsvpDeadlineDays)}
                      onChange={(e) =>
                        set("defaultRsvpDeadlineDays", Number(e.target.value))
                      }
                    >
                      {[
                        ...new Set([
                          7,
                          14,
                          21,
                          30,
                          form.defaultRsvpDeadlineDays,
                        ]),
                      ]
                        .sort((a, b) => a - b)
                        .map((d) => (
                          <option key={d} value={d}>
                            {d} days before
                          </option>
                        ))}
                    </Select>
                  </Field>
                  <Field label="Menu options" hint="Separated by commas">
                    <Input
                      value={menuText}
                      onChange={(e) => setMenuText(e.target.value)}
                    />
                  </Field>
                </FormGrid>
              </Card>

              <TeamSection isOwner={user?.role === "owner"} meId={user?.id} />
              <PasswordSection />
            </div>
          </div>
        )}
      </LoadState>
    </AdminLayout>
  );
}

function TeamSection({ isOwner, meId }: { isOwner: boolean; meId?: string }) {
  const toast = useToast();
  const team = useResource<TeamMember[]>("/api/admin/team");
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [link, setLink] = useState<{
    url: string;
    emailError: string | null;
  } | null>(null);

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

  return (
    <Card id="team" className="admin-stack">
      <CardHeader
        title="Team"
        subtitle="People who can log in to this admin."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setInviting(true)}
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
          {team.data?.map((m) => {
            const pending = !m.acceptedAt;
            return (
              <li key={m.id}>
                <Avatar name={m.name ?? m.email} size="lg" pending={pending} />
                <div className="admin-team__who">
                  <span className="admin-team__name">
                    {m.name ?? m.email}
                    {m.id === meId && (
                      <span className="admin-muted"> (you)</span>
                    )}
                  </span>
                  <span className="admin-muted">
                    {pending ? `${m.email} · invite pending` : m.email}
                  </span>
                </div>
                {isOwner && m.id !== meId ? (
                  <>
                    <label>
                      <span className="ui-sr-only">Role for {m.email}</span>
                      <Select
                        className="admin-select-sm"
                        value={m.role}
                        onChange={(e) =>
                          void act(
                            () =>
                              api.patch(`/api/admin/team/${m.id}`, {
                                role: e.target.value,
                              }),
                            "Role updated",
                          )
                        }
                      >
                        <option value="editor">Editor</option>
                        <option value="owner">Owner</option>
                      </Select>
                    </label>
                    {pending && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
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
                          }, "Invite sent again")
                        }
                      >
                        Resend
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        confirm(
                          `Remove ${m.email} from the team? They lose access immediately.`,
                        ) &&
                        void act(
                          () => api.delete(`/api/admin/team/${m.id}`),
                          "Removed",
                        )
                      }
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
          })}
        </ul>
      </LoadState>

      <Dialog
        open={inviting}
        onClose={closeInvite}
        title={link ? "Invite sent" : "Invite a team member"}
      >
        {link ? (
          <div className="admin-stack">
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
            <div className="admin-row admin-row--end">
              <Button
                variant="secondary"
                onClick={() =>
                  void copyText(link.url).then((ok) =>
                    toast(ok ? "Link copied" : "Couldn't copy"),
                  )
                }
              >
                Copy link
              </Button>
              <Button onClick={closeInvite}>Done</Button>
            </div>
          </div>
        ) : (
          <form className="admin-stack" onSubmit={invite}>
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
            <div className="admin-row admin-row--end">
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
    </Card>
  );
}

function PasswordSection() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/admin/auth/password", {
        currentPassword: current,
        newPassword: next,
      });
      setCurrent("");
      setNext("");
      toast("Password changed");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card id="account" className="admin-stack">
      <CardHeader title="Your account" subtitle="Change your password." />
      <form className="admin-stack" onSubmit={submit}>
        <IssueList error={error} />
        <FormGrid>
          <Field label="Current password">
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </Field>
          <Field label="New password" hint="At least 10 characters">
            <Input
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </Field>
        </FormGrid>
        <div>
          <Button type="submit" variant="secondary" loading={busy}>
            Change password
          </Button>
        </div>
      </form>
    </Card>
  );
}
