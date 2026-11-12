import { useState, type ReactNode } from "react";
import { ApiError, formatEventDate, type Locale, type PublicEvent, type PublicEventMeta } from "@pokanito/shared";
import { Alert, Button, Input, Spinner } from "@pokanito/ui";
import { publicApi } from "@/lib/api";
import { InvitationHead } from "./InvitationView";

const COPY = {
  mk: {
    locked: "Оваа покана е заштитена. Внесете го кодот што го добивте заедно со линкот.",
    code: "Код за пристап",
    open: "Отвори ја поканата",
    wrong: "Кодот не е точен. Обидете се повторно.",
    tooMany: "Премногу обиди. Обидете се повторно за неколку минути.",
    ended: "Оваа покана заврши. Ви благодариме што бевте дел од овој посебен ден.",
    unpublished: "Оваа покана сè уште не е објавена. Наскоро ќе биде достапна на овој линк.",
    loading: "Се вчитува…",
    previewError: "Линкот за преглед е неважечки или истечен.",
  },
  en: {
    locked: "This invitation is private. Enter the code you received with the link.",
    code: "Access code",
    open: "Open the invitation",
    wrong: "That code doesn’t match. Please try again.",
    tooMany: "Too many attempts. Please try again in a few minutes.",
    ended: "This invitation has ended. Thank you for being part of a special day.",
    unpublished: "This invitation isn’t published yet. It will be available at this link soon.",
    loading: "Loading…",
    previewError: "This preview link is invalid or has expired.",
  },
};

const copyFor = (meta: { languages: Locale[] }) => COPY[meta.languages[0] ?? "mk"];

function Shell({ meta, children }: { meta: PublicEventMeta; children: ReactNode }) {
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

export function EndedView({ meta }: { meta: PublicEventMeta }) {
  return (
    <Shell meta={meta}>
      <p className="state-page__text">{copyFor(meta).ended}</p>
    </Shell>
  );
}

export function UnpublishedView({ meta, error }: { meta: PublicEventMeta; error?: boolean }) {
  const c = copyFor(meta);
  return (
    <Shell meta={meta}>
      <p className="state-page__text">{error ? c.previewError : c.unpublished}</p>
    </Shell>
  );
}

export function LoadingView({ meta }: { meta: PublicEventMeta }) {
  return (
    <Shell meta={meta}>
      <p className="state-page__text" role="status">
        <Spinner /> {copyFor(meta).loading}
      </p>
    </Shell>
  );
}

const storageKey = (slug: string) => `pokanito:unlock:${slug}`;

/** Remembered access code for this tab (codes are shared with guests, not secrets). */
export function rememberedCode(slug: string): string | null {
  try {
    return sessionStorage.getItem(storageKey(slug));
  } catch {
    return null;
  }
}

export async function unlock(slug: string, code: string) {
  const res = await publicApi.unlock(slug, code);
  try {
    sessionStorage.setItem(storageKey(slug), code);
  } catch {
    /* private mode — guest just re-enters the code next time */
  }
  return res;
}

export function forgetCode(slug: string) {
  try {
    sessionStorage.removeItem(storageKey(slug));
  } catch {
    /* ignore */
  }
}

export function LockedView({
  meta,
  onUnlocked,
}: {
  meta: PublicEventMeta;
  onUnlocked: (event: PublicEvent, token: string) => void;
}) {
  const c = copyFor(meta);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await unlock(meta.slug, code.trim());
      onUnlocked(res.event, res.token);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? c.tooMany : c.wrong);
      setBusy(false);
    }
  };

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
