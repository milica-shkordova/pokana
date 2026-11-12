import { Fragment } from "react";
import { useInvitation } from "../engine/runtime";
import { useCountdown, useFooter, useRsvpDeadlineText, useVenues } from "../engine/hooks";
import { CountdownUnits, MapFrame, MapsLink, OptionalText, Photo } from "../engine/components";
import { RsvpNameField, RsvpResult, RsvpSection, RsvpSubmitDecline, type RsvpClasses } from "../engine/rsvp";
import { TemplateShell } from "../engine/TemplateShell";
import { pick, TIME } from "../engine/format";
import { COPY } from "./copy";
import st from "./Template.module.scss";

const rsvpClasses: RsvpClasses = {
  section: st.register,
  heading: st.registerTitle,
  note: st.registerNote,
  form: st.form,
  label: st.label,
  input: st.input,
  error: st.error,
  success: st.success,
  submit: st.submit,
  decline: st.decline,
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
      <OptionalText className={st.eyebrow}>{t(c.eyebrow)}</OptionalText>
      <h1 className={st.title}>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {i === lines.length - 1 && lines.length > 1 ? <span className={st.accent}>{line}</span> : line}
          </Fragment>
        ))}
      </h1>
      <OptionalText as="p" className={st.intro}>
        {t(c.tagline)}
      </OptionalText>
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
      <CountdownUnits units={c.units} classes={{ item: st.countdownBox, num: st.countdownNum, unit: st.countdownUnit }} />
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
            <OptionalText className={st.speakerRole}>{t(p.role)}</OptionalText>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Register() {
  const { t, s, event } = useInvitation();
  const deadline = useRsvpDeadlineText();
  // Both lines, unlike the other designs (note, else deadline).
  const note = [t(event.content.rsvp?.note), deadline].filter(Boolean).join(" ");
  return (
    <RsvpSection id="corp-register" classes={rsvpClasses} note={note}>
      {(f) => (
        <>
          <RsvpNameField f={f} classes={rsvpClasses} />
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
          <RsvpResult f={f} classes={rsvpClasses} />
          <RsvpSubmitDecline f={f} classes={rsvpClasses} />
        </>
      )}
    </RsvpSection>
  );
}

function Venue() {
  const { t, s } = useInvitation();
  const { heading, venues } = useVenues();
  return (
    <section className={st.venueSection}>
      <h2 className={st.h2}>{heading || s.location}</h2>
      {venues.map((v) => (
        <div key={v.id} className={st.venue} data-reveal>
          <MapFrame venue={v} classes={{ wrap: st.mapWrap, map: st.map }} />
          <span className={st.venueAddress}>{[t(v.name), t(v.address)].filter(Boolean).join(", ")}</span>
          <OptionalText className={st.muted}>{t(v.note)}</OptionalText>
          <MapsLink venue={v} className={st.directions}>
            {s.directions}
          </MapsLink>
        </div>
      ))}
    </section>
  );
}

function Footer() {
  const f = useFooter();
  return (
    <footer className={st.footer}>
      <span className={st.footerCompany}>{f.organizer}</span>
      <span>{f.contact || f.text}</span>
    </footer>
  );
}

/** Conference & Summit / Product Launch — CorporateLaunch.dc.html. */
export default function Corporate() {
  return (
    <TemplateShell
      classes={{ page: st.page, phone: st.phone }}
      hero={
        <>
          <TopBar />
          <Hero />
        </>
      }
      sections={{
        countdown: () => <Countdown />,
        program: () => <Agenda />,
        people: () => <Speakers />,
        rsvp: () => <Register />,
        location: () => <Venue />,
        footer: () => <Footer />,
      }}
    />
  );
}
