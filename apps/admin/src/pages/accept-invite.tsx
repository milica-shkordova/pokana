import Head from "next/head";
import { Alert, Button, Card, Field, Input, Spinner, Wordmark } from "@pokanito/ui";
import { useAcceptInvite } from "@/features/auth/useAcceptInvite";

export default function AcceptInvitePage() {
  const { invite, loadError, name, setName, password, setPassword, saving, error, submit } = useAcceptInvite();

  return (
    <main className="admin-login ui-root">
      <Head>
        <title>Join the team · Pokanito Admin</title>
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
          <form className="ui-stack" onSubmit={submit}>
            <p className="ui-muted">
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
