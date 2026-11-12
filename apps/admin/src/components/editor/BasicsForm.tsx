import { useEffect, useState } from "react";
import {
  slugSchema,
  utcToZoned,
  zonedToUtc,
  type EventDetail,
  type Locale,
} from "@pokanito/shared";
import {
  Button,
  Field,
  FormGrid,
  Input,
  InputGroup,
  Select,
  SwitchRow,
  useToast,
} from "@pokanito/ui";
import { api, errorMessage, WEB_HOST } from "@/lib/api";
import { parseEmails } from "@/lib/format";
import { IconMail } from "../Icons";
import { EditorCard, LocalizedField } from "./fields";
import { setContent, type FormProps } from "./context";

type LangChoice = "mk" | "en" | "both";
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default function BasicsForm(
  props: FormProps & {
    applyServer: (e: EventDetail) => void;
    flush: () => Promise<void>;
  },
) {
  const { event, def, languages, update, updateContent, applyServer, flush } =
    props;
  const toast = useToast();
  const c = event.content;
  const d = def.defaultContent;
  const set = <K extends keyof typeof c>(k: K) => setContent(updateContent, k);
  const zoned = utcToZoned(event.eventDate);

  // ── Slug with live availability ──
  const [slug, setSlug] = useState(event.slug);
  const [slugState, setSlugState] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  useEffect(() => setSlug(event.slug), [event.slug]);
  useEffect(() => {
    if (slug === event.slug) {
      setSlugState(null);
      return;
    }
    const local = slugSchema.safeParse(slug);
    if (!local.success) {
      setSlugState({
        ok: false,
        msg: local.error.issues[0]?.message ?? "Invalid link",
      });
      return;
    }
    setSlugState({ ok: false, msg: "Checking…" });
    const t = setTimeout(async () => {
      try {
        const r = await api.get<{ available: boolean; reason?: string }>(
          `/api/admin/events/slug-available?slug=${encodeURIComponent(slug)}&exceptId=${event.id}`,
        );
        setSlugState(
          r.available
            ? { ok: true, msg: "Available" }
            : { ok: false, msg: r.reason ?? "Taken" },
        );
        if (r.available) update({ slug });
      } catch (err) {
        setSlugState({ ok: false, msg: errorMessage(err) });
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ── RSVP emails ──
  const [emails, setEmails] = useState(event.rsvpEmails.join(", "));
  const [testing, setTesting] = useState(false);
  const [testedTo, setTestedTo] = useState<string[] | null>(null);
  const parsed = parseEmails(emails);
  const badEmail = parsed.find((e) => !isEmail(e));

  const sendTest = async () => {
    setTesting(true);
    try {
      await flush();
      const res = await api.post<{ to: string[]; dev?: boolean }>(
        `/api/admin/events/${event.id}/test-email`,
      );
      setTestedTo(res.to);
      applyServer(await api.get<EventDetail>(`/api/admin/events/${event.id}`));
      if (res.dev) toast("Dev mode: the email was printed in the API console");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setTesting(false);
    }
  };

  const lang: LangChoice =
    languages.length > 1 ? "both" : (languages[0] as LangChoice);
  const setLang = (v: LangChoice) =>
    update({ languages: v === "both" ? (["mk", "en"] as Locale[]) : [v] });

  const isWedding = def.category === "wedding";

  return (
    <EditorCard
      title="Basics"
      aside="Shown in the header, countdown and link preview"
    >
      <FormGrid className="admin-basics-grid">
        {isWedding ? (
          <>
            <LocalizedField
              label="First name (bride)"
              value={c.partnerOne}
              languages={languages}
              onChange={(v) =>
                updateContent((cc) => ({
                  ...cc,
                  partnerOne: v,
                  names: joinNames(v, cc.partnerTwo, languages),
                }))
              }
            />
            <LocalizedField
              label="First name (groom)"
              value={c.partnerTwo}
              languages={languages}
              onChange={(v) =>
                updateContent((cc) => ({
                  ...cc,
                  partnerTwo: v,
                  names: joinNames(cc.partnerOne, v, languages),
                }))
              }
            />
          </>
        ) : (
          <LocalizedField
            label="Names / headline"
            value={c.names}
            languages={languages}
            onChange={set("names")}
          />
        )}
        <div className="admin-date-time">
          <Field label="Event date" hint="Skopje time">
            <Input
              type="date"
              value={zoned.date}
              onChange={(e) =>
                e.target.value &&
                update({ eventDate: zonedToUtc(e.target.value, zoned.time) })
              }
            />
          </Field>
          <Field label="Time">
            <Input
              type="time"
              value={zoned.time}
              onChange={(e) =>
                e.target.value &&
                update({ eventDate: zonedToUtc(zoned.date, e.target.value) })
              }
            />
          </Field>
        </div>
        <Field label="Language">
          <Select
            value={lang}
            onChange={(e) => setLang(e.target.value as LangChoice)}
          >
            <option value="mk">Македонски</option>
            <option value="en">English</option>
            <option value="both">Both (toggle)</option>
          </Select>
        </Field>
        {d.eyebrow !== undefined && (
          <LocalizedField
            label="Line above the names"
            value={c.eyebrow}
            languages={languages}
            onChange={set("eyebrow")}
          />
        )}
        {d.tagline !== undefined && (
          <LocalizedField
            label="Tagline"
            value={c.tagline}
            languages={languages}
            onChange={set("tagline")}
            multiline
            rows={2}
          />
        )}
        {d.age !== undefined && (
          <Field label="Age">
            <Input
              type="number"
              min={0}
              max={150}
              value={c.age ?? ""}
              onChange={(e) =>
                updateContent((cc) => ({
                  ...cc,
                  age:
                    e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
            />
          </Field>
        )}
        {d.organizer !== undefined && (
          <LocalizedField
            label="Hosts / organizer"
            value={c.organizer}
            languages={languages}
            onChange={set("organizer")}
          />
        )}
        {d.city !== undefined && (
          <LocalizedField
            label="City"
            value={c.city}
            languages={languages}
            onChange={set("city")}
          />
        )}
      </FormGrid>

      {/* Template defaults have no link or client — those are set per event. */}
      {!event.isDefaults && (
        <>
          <Field
            label="Invitation link"
            error={
              slugState && !slugState.ok && slugState.msg !== "Checking…"
                ? slugState.msg
                : undefined
            }
          >
            <InputGroup
              prefix={`${WEB_HOST}/`}
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              suffix={
                slugState?.ok || slug === event.slug ? (
                  <span className="admin-ok">
                    {slug === event.slug ? "Saved" : "Available"}
                  </span>
                ) : slugState?.msg === "Checking…" ? (
                  <span className="admin-muted">Checking…</span>
                ) : undefined
              }
            />
          </Field>

          <div className="admin-stack-sm">
            <label htmlFor="rsvp-email" className="ui-field__label">
              Send RSVP replies to
            </label>
            <div className="admin-row admin-row--wrap">
              <div className="admin-email-input">
                <IconMail />
                <input
                  id="rsvp-email"
                  type="text"
                  inputMode="email"
                  value={emails}
                  placeholder="client@example.com"
                  aria-invalid={badEmail ? true : undefined}
                  onChange={(e) => {
                    setEmails(e.target.value);
                    setTestedTo(null);
                    const list = parseEmails(e.target.value);
                    if (!list.some((x) => !isEmail(x)))
                      update({ rsvpEmails: list });
                  }}
                />
              </div>
              <Button
                variant="secondary"
                onClick={sendTest}
                loading={testing}
                disabled={!parsed.length || !!badEmail}
              >
                Send test email
              </Button>
            </div>
            {badEmail ? (
              <span className="ui-field__error">
                “{badEmail}” isn&apos;t a valid email
              </span>
            ) : testedTo ? (
              <span className="admin-ok">
                Test RSVP sent to {testedTo.join(", ")}, ask the client to check
                spam too.
              </span>
            ) : event.rsvpTestedAt && event.rsvpEmails.length ? (
              <span className="admin-ok">
                Tested ✓ — replies will arrive at these addresses.
              </span>
            ) : (
              <span className="admin-muted">
                Each reply arrives as one email with the guest’s name,
                attendance, number of guests and menu choice. Add more addresses
                separated by commas.
              </span>
            )}
          </div>
        </>
      )}
    </EditorCard>
  );
}

/** Admin-only details: never rendered on the invitation itself. */
export function ClientForm({ event, update }: FormProps) {
  return (
    <EditorCard
      title="Client & sharing"
      aside="Only for you and the client — not shown on the invitation"
    >
      <FormGrid>
        <Field
          label="Event name"
          hint="Admin list & link preview, e.g. “Ана & Марко”"
        >
          <Input
            value={event.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </Field>
        <Field label="Client name">
          <Input
            value={event.clientName}
            onChange={(e) => update({ clientName: e.target.value })}
          />
        </Field>
        <Field label="Client contact">
          <Input
            value={event.clientContact}
            onChange={(e) => update({ clientContact: e.target.value })}
          />
        </Field>
        <Field
          label="Expected guests"
          hint="Shows as received / expected in the events list"
        >
          <Input
            type="number"
            min={0}
            value={event.expectedGuests ?? ""}
            onChange={(e) =>
              update({
                expectedGuests:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </Field>
        <Field
          label="Guest access code"
          hint="Guests type it before the invitation opens. Leave empty for none."
        >
          <Input
            value={event.accessCode ?? ""}
            onChange={(e) => update({ accessCode: e.target.value || null })}
          />
        </Field>
      </FormGrid>
      <SwitchRow
        label="Hide from Google"
        hint="Only people with the link can find it (noindex)."
        checked={event.noindex}
        onChange={(v) => update({ noindex: v })}
      />
    </EditorCard>
  );
}

function joinNames(
  a: Record<string, string | undefined> | undefined,
  b: Record<string, string | undefined> | undefined,
  langs: Locale[],
) {
  return Object.fromEntries(
    langs.map((l) => [l, [a?.[l], b?.[l]].filter(Boolean).join(" & ")]),
  );
}
