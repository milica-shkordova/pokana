import { Fragment } from "react";
import type { SectionKind } from "@pokanito/shared";
import { useInvitation } from "../engine/runtime";
import { useCountdown, useRsvpDeadlineText } from "../engine/hooks";
import { useRsvpForm } from "../engine/useRsvpForm";
import { LanguageToggle, MapEmbed, MapsLink, MusicButton, Photo, PreviewNotice } from "../engine/components";
import { pick, TIME } from "../common/format";
import st from "./Template.module.scss";

const COPY = {
  en: { inviteOnly: "Invite only" },
  mk: { inviteOnly: "Само со покана" },
};

function TopBar() {
  const { t, event, locale } = useInvitation();
  return (
    <div className={st.topbar}>
      <span className={st.company}>{t(event.content.organizer)}</span>
      <span className={st.inviteOnly}>{pick(COPY, locale).inviteOnly}</span>
    </div>
  );
}

function Hero() {
  const { t, event, date } = useInvitation();
  const c = event.content;
  const lines = t(c.names).split("\n");
  const venue = c.location?.venues[0];
  return (
    <header className={st.hero}>
      {t(c.eyebrow) && <span className={st.eyebrow}>{t(c.eyebrow)}</span>}
      <h1 className={st.title}>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {i === lines.length - 1 && lines.length > 1 ? <span className={st.accent}>{line}</span> : line}
          </Fragment>
        ))}
      </h1>
      {t(c.tagline) && <p className={st.intro}>{t(c.tagline)}</p>}
      <div className={st.chips}>
        <span className={st.chip}>
          <b>{date({ day: "numeric", month: "short" })}</b> · {date(TIME)}
        </span>
        {venue && (
          <span className={st.chip}>
            <b>{t(venue.name)}</b>
            {t(c.city) && <> · {t(c.city)}</>}
          </span>
        )}
      </div>
      <div className={st.visual} data-reveal>
        <Photo slot="visual" className={st.visualImg} priority />
      </div>
    </header>
  );
}

function Countdown() {
  const { s } = useInvitation();
  const c = useCountdown();
  if (c.done) return <p className={st.done}>{s.countdownDone}</p>;
  return (
    <div className={st.countdown} role="timer" data-reveal>
      {(
        [
          [c.days, s.days],
          [c.hours, s.hours],
          [c.minutes, s.minutes],
          [c.seconds, s.seconds],
        ] as const
      ).map(([n, unit], i) => (
        <div key={unit} className={st.countdownBox}>
          <span className={st.countdownNum}>{c.ready ? (i === 0 ? n : String(n).padStart(2, "0")) : "–"}</span>
          <span className={st.countdownUnit}>{unit}</span>
        </div>
      ))}
    </div>
  );
}

function Agenda() {
  const { t, event, s } = useInvitation();
  const p = event.content.program;
  return (
    <section className={st.section}>
      <h2 className={st.h2}>{t(p?.heading) || s.program}</h2>
      <ol className={st.agenda}>
        {p?.items.map((item) => (
          <li key={item.id} className={st.agendaRow} data-reveal>
            <span className={st.agendaTime}>{item.time}</span>
            <span>
              {t(item.title)}
              {(t(item.note) || t(item.place)) && (
                <>
                  <br />
                  <span className={st.muted}>{t(item.note) || t(item.place)}</span>
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Speakers() {
  const { t, event } = useInvitation();
  const people = event.content.people;
  if (!people?.items.length) return null;
  return (
    <section className={st.section}>
      <h2 className={st.h2}>{t(people.heading)}</h2>
      <ul className={st.speakers}>
        {people.items.map((p) => (
          <li key={p.id} className={st.speaker} data-reveal>
            <span className={st.speakerPhoto}>
              <Photo mediaId={p.photo} className={st.fill} sizes="140px" />
            </span>
            <span className={st.speakerName}>{t(p.name)}</span>
            {t(p.role) && <span className={st.speakerRole}>{t(p.role)}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Register() {
  const { t, s, event } = useInvitation();
  const f = useRsvpForm();
  const deadline = useRsvpDeadlineText();
  const note = [t(event.content.rsvp?.note), deadline].filter(Boolean).join(" ");
  return (
    <section className={st.register} aria-labelledby="corp-register">
      <h2 id="corp-register" className={st.registerTitle}>
        {t(event.content.rsvp?.heading) || s.rsvpHeading}
      </h2>
      {!f.open ? (
        <p className={st.registerNote}>{s.rsvpClosed}</p>
      ) : (
        <form
          className={st.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void f.submitAs(true);
          }}
        >
          {note && <p className={st.registerNote}>{note}</p>}
          <label className={st.label}>
            {s.name}
            <input className={st.input} value={f.fields.name} onChange={(e) => f.set("name", e.target.value)} autoComplete="name" />
          </label>
          {f.error("name") && <span className={st.error}>{f.error("name")}</span>}
          <label className={st.label}>
            {s.company}
            <input className={st.input} value={f.fields.company} onChange={(e) => f.set("company", e.target.value)} autoComplete="organization" />
          </label>
          <label className={st.label}>
            {s.workEmail}
            <input
              className={st.input}
              type="email"
              value={f.fields.email}
              onChange={(e) => f.set("email", e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className={st.checkbox}>
            <input type="checkbox" checked={f.fields.dinner} onChange={(e) => f.set("dinner", e.target.checked)} />
            {s.dinner}
          </label>
          {f.resultText && (
            <p className={f.failed ? st.error : st.success} role="status">
              {f.resultText}
            </p>
          )}
          <button type="submit" className={st.submit} disabled={f.sending}>
            {f.sending ? s.sending : s.submit}
          </button>
          <button type="button" className={st.decline} disabled={f.sending} onClick={() => void f.submitAs(false)}>
            {s.notAttending}
          </button>
        </form>
      )}
    </section>
  );
}

function Venue() {
  const { t, s, event } = useInvitation();
  const loc = event.content.location;
  return (
    <section className={st.venueSection}>
      <h2 className={st.h2}>{t(loc?.heading) || s.location}</h2>
      {loc?.venues.map((v) => (
        <div key={v.id} className={st.venue} data-reveal>
          <div className={st.mapWrap}>
            <MapEmbed venue={v} className={st.map} />
          </div>
          <span className={st.venueAddress}>{[t(v.name), t(v.address)].filter(Boolean).join(", ")}</span>
          {t(v.note) && <span className={st.muted}>{t(v.note)}</span>}
          <MapsLink venue={v} className={st.directions}>
            {s.directions}
          </MapsLink>
        </div>
      ))}
    </section>
  );
}

function Footer() {
  const { t, event } = useInvitation();
  const c = event.content;
  return (
    <footer className={st.footer}>
      <span className={st.footerCompany}>{t(c.organizer)}</span>
      <span>{t(c.footer?.contact) || t(c.footer?.text)}</span>
    </footer>
  );
}

/** Conference & Summit / Product Launch — CorporateLaunch.dc.html. */
export default function Corporate() {
  const { sections, themeStyle } = useInvitation();
  const render: Partial<Record<SectionKind, () => JSX.Element | null>> = {
    countdown: () => <Countdown />,
    program: () => <Agenda />,
    people: () => <Speakers />,
    rsvp: () => <Register />,
    location: () => <Venue />,
    footer: () => <Footer />,
  };
  return (
    <div className={st.page} style={themeStyle}>
      <main className={st.phone}>
        <PreviewNotice />
        <LanguageToggle />
        <MusicButton />
        <TopBar />
        <Hero />
        {sections.map((id) => (
          <Fragment key={id}>{render[id]?.()}</Fragment>
        ))}
      </main>
    </div>
  );
}
