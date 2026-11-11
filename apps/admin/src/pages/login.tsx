import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import type { CurrentUser } from "@momentelo/shared";
import { Alert, Button, Card, Field, Input, Wordmark } from "@momentelo/ui";
import { api, errorMessage } from "@/lib/api";
import { useSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      setUser(await api.post<CurrentUser>("/api/admin/auth/login", { email, password }));
      const next = typeof router.query.next === "string" && router.query.next.startsWith("/") ? router.query.next : "/";
      await router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login ui-root">
      <Head>
        <title>Sign in · Momentelo Admin</title>
      </Head>
      <Card className="admin-login__card">
        <form className="admin-stack" onSubmit={handleSubmit}>
          <div className="admin-login__brand">
            <Wordmark />
            <span className="admin__brand-tag">Admin</span>
          </div>
          <p className="admin-muted">Sign in with your team account.</p>
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
