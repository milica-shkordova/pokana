import { Button, Card, CardHeader, Field, FormGrid, Input, IssueList } from "@pokanito/ui";
import { usePasswordChange } from "./usePasswordChange";

export default function PasswordSection() {
  const { current, setCurrent, next, setNext, busy, error, submit } = usePasswordChange();
  return (
    <Card id="account" className="ui-stack">
      <CardHeader title="Your account" subtitle="Change your password." />
      <form className="ui-stack" onSubmit={submit}>
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
