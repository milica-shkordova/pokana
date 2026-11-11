import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import type { CurrentUser } from "@momentelo/shared";
import { Alert, Button, Card, Field, Input, Spinner, Wordmark } from "@momentelo/ui";
import { api, errorMessage } from "@/lib/api";
import { useSession } from "@/lib/session";

export default function AcceptInvitePage() {
  const router = useRouter();
  const { setUser } = useSession();
  const token = typeof router.query.token === "string" ? router.query.token : "";
  const [invite, setInvite] = useState<{ email: string; name: string | null } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!token) {
      setLoadError("This invite link is incomplete.");
      return;
    }
    api
      .get<{ email: string; name: string | null }>(`/api/admin/auth/invite?token=${encodeURIComponent(token)}`)
      .then((i) => {
        setInvite(i);
        setName(i.name ?? "");
      })
      .catch((err) => setLoadError(errorMessage(err)));
  }, [router.isReady, token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      setUser(await api.post<CurrentUser>("/api/admin/auth/accept-invite", { token, name, password }));
      await router.replace("/");
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <main className="admin-login ui-root">
      <Head>
        <title>Join the team · Momentelo Admin</title>
      </Head>
      <Card className="admin-login__card">
        <div className="admin-login__brand">
          <Wordmark />
          <span className="admin__brand-tag">Admin</span>
        </div>
        {loadError ? (
          <Alert tone="danger">{loadError} Ask the owner to resend the invite.</Alert>
        ) : !invite ? (
          <div className="admin-loading">
            <Spinner size="lg" />
          </div>
        ) : (
          <form className="admin-stack" onSubmit={submit}>
            <p className="admin-muted">
              Welcome! Choose your name and a password for <strong>{invite.email}</strong>.
            </p>
            {error && <Alert tone="danger">{error}</Alert>}
            <Field label="Your name">
              <Input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </Field>
            <Field label="Password" hint="At least 10 characters">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} autoComplete="new-password" />
            </Field>
            <Button type="submit" block size="lg" loading={saving}>
              Join the team
            </Button>
          </form>
        )}
      </Card>
    </main>
  );
}
