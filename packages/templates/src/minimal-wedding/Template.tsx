import { Fragment } from "react";
import { pad2, type SectionKind } from "@pokanito/shared";
import { useInvitation } from "../engine/runtime";
import { useCountdown, useRsvpDeadlineText } from "../engine/hooks";
import { useRsvpForm } from "../engine/useRsvpForm";
import { LanguageToggle, MapEmbed, MapsLink, Multiline, MusicButton, Photo, PreviewNotice } from "../engine/components";
import { dateParts, initials, pick } from "../common/format";
import st from "./Template.module.scss";

const COPY = {
  mk: { days: "дена", hours: "часа", minutes: "минути", and: "и", joiner: "и" },
  en: { days: "days", hours: "hours", minutes: "minutes", and: "and", joiner: "&" },
};

/** Numbered section label: "02 — Програма". */
function Label({ n, text }: { n: number; text: string }) {
  return (
    <span className={st.label}>
      {pad2(n)} — {text}
    </span>
  );
}

function Hero() {
  const { t, event, locale } = useInvitation();
  const c = event.content;
  const dp = dateParts(event.eventDate);
  const one = t(c.partnerOne);
  const two = t(c.partnerTwo);
  return (
    <header>
      <div className={st.topRow}>
        <span>{t(c.eyebrow)}</span>
        <span>{t(c.city)}</span>
      </div>
      <div className={st.bigDate} aria-label={`${dp.d}.${dp.m}.${dp.y}`}>
        <span>{dp.d}</span>
        <span className={st.accent}>{dp.m}</span>
        <span>{dp.yy}</span>
      </div>
      <h1 className={st.names}>
        {one && two ? (
          <>
            <span>{one}</span>
            <span className={st.and}>{pick(COPY, locale).joiner}</span>
            <span>{two}</span>
          </>
        ) : (
          <span>{t(c.names)}</span>
        )}
      </h1>
      <div className={st.hero} data-reveal>
        <Photo slot="hero" className={st.heroImg} priority />
      </div>
    </header>
  );
}

function Welcome({ n }: { n: number }) {
  const { t, event } = useInvitation();
  const w = event.content.welcome;
  return (
    <section className={st.section} data-reveal>
      <Label n={n} text={t(w?.heading)} />
      <Multiline text={t(w?.text)} className={st.lead} />
    </section>
  );
}

function Countdown() {
  const { t, s, event, locale } = useInvitation();
  const c = useCountdown();
  const copy = pick(COPY, locale);
  return (
    <section className={st.countdown} data-reveal>
      {c.done ? (
        <span className={st.countdownText}>{s.countdownDone}</span>
      ) : (
        <>
          <span className={st.countdownNum}>{c.ready ? c.days : "–"}</span>
          <span className={st.countdownText}>
            {copy.days}, {c.ready ? c.hours : "–"} {copy.hours} {copy.and} {c.ready ? c.minutes : "–"} {copy.minutes}
            <br />
            {t(event.content.countdown?.heading)}
          </span>
        </>
      )}
    </section>
  );
}

function Program({ n }: { n: number }) {
  const { t, event, s } = useInvitation();
  const p = event.content.program;
  return (
    <section className={st.section}>
      <Label n={n} text={t(p?.heading) || s.program} />
      <dl className={st.program}>
        {p?.items.map((item) => (
          <Fragment key={item.id}>
            <dt className={st.programTime} data-reveal>
              {item.time}
            </dt>
            <dd data-reveal>
              {t(item.title)}
              {t(item.place) && (
                <>
                  <br />
                  <span className={st.muted}>{t(item.place)}</span>
                </>
              )}
            </dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}

function Rsvp({ n }: { n: number }) {
  const { t, s, event } = useInvitation();
  const f = useRsvpForm();
  const deadline = useRsvpDeadlineText();
  const guest = f.guests[0];
  return (
    <section className={st.section} aria-labelledby="min-rsvp">
      <Label n={n} text={s.rsvpHeading} />
      <h2 id="min-rsvp" className={st.h2}>
        {t(event.content.rsvp?.heading)}
      </h2>
      {!f.open ? (
        <p className={st.muted}>{s.rsvpClosed}</p>
      ) : (
        <form
          className={st.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void f.submitAs(true);
          }}
        >
          {(t(event.content.rsvp?.note) || deadline) && <p className={st.muted}>{t(event.content.rsvp?.note) || deadline}</p>}
          {guest && (
            <>
              <label className={st.field}>
                {s.name}
                <input
                  className={st.input}
                  value={guest.name}
                  onChange={(e) => f.updateGuest(guest.key, { name: e.target.value })}
                  autoComplete="name"
                />
              </label>
              {f.error(`guest-${guest.key}-name`) && <span className={st.error}>{s.required}</span>}
              {f.needsMenu && (
                <>
                  <label className={st.field}>
                    {s.menu}
                    <select className={st.input} value={guest.menu} onChange={(e) => f.updateGuest(guest.key, { menu: e.target.value })}>
                      <option value="" disabled>
                        {s.chooseMenu}
                      </option>
                      {f.menuOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                  {f.error(`guest-${guest.key}-menu`) && <span className={st.error}>{s.required}</span>}
                </>
              )}
            </>
          )}
          {f.resultText && (
            <p className={f.failed ? st.error : st.success} role="status">
              {f.resultText}
            </p>
          )}
          <div className={st.buttons}>
            <button type="submit" className={st.yes} disabled={f.sending}>
              {f.sending && f.attending ? s.sending : s.submit}
            </button>
            <button type="button" className={st.no} disabled={f.sending} onClick={() => void f.submitAs(false)}>
              {f.sending && !f.attending ? s.sending : s.submitDecline}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Location({ n }: { n: number }) {
  const { t, s, event } = useInvitation();
  const loc = event.content.location;
  return (
    <section className={st.section}>
      <Label n={n} text={t(loc?.heading) || s.location} />
      {loc?.venues.map((v) => (
        <div key={v.id} className={st.venue} data-reveal>
          <div className={st.mapWrap}>
            <MapEmbed venue={v} className={st.map} />
          </div>
          <div className={st.venueRow}>
            <span>{[t(v.label), t(v.name), t(v.address)].filter(Boolean).join(", ")}</span>
            <MapsLink venue={v} className={st.directions}>
              {s.directions}
            </MapsLink>
          </div>
        </div>
      ))}
    </section>
  );
}

function Footer() {
  const { t, event } = useInvitation();
  const c = event.content;
  const dp = dateParts(event.eventDate);
  const one = t(c.partnerOne);
  const two = t(c.partnerTwo);
  return (
    <footer className={st.footer}>
      <span className={st.footerInitials}>{t(c.footer?.text) || (one && two ? `${one[0]} & ${two[0]}` : initials(t(c.names)))}</span>
      <span className={st.footerDate}>
        {dp.d}.{dp.m}.{dp.y}
      </span>
    </footer>
  );
}

/** Modern Minimal Wedding — MinimalWedding.dc.html. */
export default function MinimalWedding() {
  const { sections, themeStyle } = useInvitation();
  // Numbered sections count up in render order (01 — Покана, 02 — Програма…).
  let n = 0;
  const numbered = (el: (n: number) => JSX.Element) => el(++n);
  const render: Partial<Record<SectionKind, () => JSX.Element>> = {
    welcome: () => numbered((i) => <Welcome n={i} />),
    countdown: () => <Countdown />,
    program: () => numbered((i) => <Program n={i} />),
    rsvp: () => numbered((i) => <Rsvp n={i} />),
    location: () => numbered((i) => <Location n={i} />),
    footer: () => <Footer />,
  };
  return (
    <div className={st.page} style={themeStyle}>
      <main className={st.phone}>
        <PreviewNotice />
        <LanguageToggle />
        <MusicButton />
        <Hero />
        {sections.map((id) => (
          <Fragment key={id}>{render[id]?.()}</Fragment>
        ))}
      </main>
    </div>
  );
}
