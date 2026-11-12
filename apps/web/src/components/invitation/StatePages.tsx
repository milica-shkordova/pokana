import { formatEventDate } from "@pokanito/shared";
import { Alert, Button, Input, Spinner } from "@pokanito/ui";
import { InvitationHead } from "./InvitationView";
import { copyFor } from "./copy";
import { useUnlockForm } from "./hooks/useUnlockForm";
import type { LockedViewProps, StatePageProps, StateShellProps, UnpublishedViewProps } from "./types";

function Shell({ meta, children }: StateShellProps) {
  const locale = meta.languages[0] ?? "mk";
  return (
    <main className="state-page ui-root">
      <InvitationHead
        templateId={meta.templateId}
        title={meta.name}
        slug={meta.slug}
        eventDate={meta.eventDate}
        locale={locale}
        noindex={meta.noindex}
      />
      <div className="state-page__card">
        <span className="state-page__date">{formatEventDate(meta.eventDate, locale)}</span>
        <span className="state-page__rule" />
        <h1 className="state-page__names">{meta.name}</h1>
        <span className="state-page__rule" />
        {children}
        <p className="state-page__footer">
          <a href="/">Pokanito</a>
        </p>
      </div>
    </main>
  );
}

export function EndedView({ meta }: StatePageProps) {
  return (
    <Shell meta={meta}>
      <p className="state-page__text">{copyFor(meta).ended}</p>
    </Shell>
  );
}

export function UnpublishedView({ meta, error }: UnpublishedViewProps) {
  const c = copyFor(meta);
  return (
    <Shell meta={meta}>
      <p className="state-page__text">{error ? c.previewError : c.unpublished}</p>
    </Shell>
  );
}

export function LoadingView({ meta }: StatePageProps) {
  return (
    <Shell meta={meta}>
      <p className="state-page__text" role="status">
        <Spinner /> {copyFor(meta).loading}
      </p>
    </Shell>
  );
}

export function LockedView({ meta, onUnlocked }: LockedViewProps) {
  const c = copyFor(meta);
  const { code, setCode, busy, error, submit } = useUnlockForm(meta, c, onUnlocked);

  return (
    <Shell meta={meta}>
      <p className="state-page__text">{c.locked}</p>
      <form className="state-page__form" onSubmit={submit}>
        <label className="ui-sr-only" htmlFor="access-code">
          {c.code}
        </label>
        <Input
          id="access-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={c.code}
          autoComplete="off"
          inputMode="text"
          autoFocus
          required
          aria-invalid={error ? true : undefined}
        />
        {error && <Alert tone="danger">{error}</Alert>}
        <Button type="submit" size="lg" block loading={busy}>
          {c.open}
        </Button>
      </form>
    </Shell>
  );
}
