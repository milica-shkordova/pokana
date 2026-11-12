import Head from "next/head";
import { Alert, Button, Card, Field, Input, Wordmark } from "@pokanito/ui";
import { useLogin } from "@/features/auth/useLogin";

export default function LoginPage() {
  const { email, setEmail, password, setPassword, submitting, error, handleSubmit } = useLogin();

  return (
    <main className="admin-login ui-root">
      <Head>
        <title>Sign in · Pokanito Admin</title>
      </Head>
      <Card className="admin-login__card">
        <form className="ui-stack" onSubmit={handleSubmit}>
          <div className="admin-login__brand">
            <Wordmark />
            <span className="admin__brand-tag">Admin</span>
          </div>
          <p className="ui-muted">Sign in with your team account.</p>
          {error && <Alert tone="danger">{error}</Alert>}
          <Field label="Email">
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </Field>
          <Field label="Password">
            <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Button type="submit" block size="lg" loading={submitting}>
            Sign in
          </Button>
        </form>
      </Card>
    </main>
  );
}
