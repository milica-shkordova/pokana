import { useInvitation } from "../engine/runtime";
import { useCountdown, useFooter, useVenues } from "../engine/hooks";
import { CountdownUnits, MapFrame, MapsLink, Multiline, OptionalText, Photo } from "../engine/components";
import { RsvpCountField, RsvpNameField, RsvpResult, RsvpSection, RsvpYesNoButtons, type RsvpClasses } from "../engine/rsvp";
import { TemplateShell } from "../engine/TemplateShell";
import { cap } from "../engine/format";
import { FooterLine, Florals } from "./ornaments";
import st from "./Template.module.scss";

const rsvpClasses: RsvpClasses = {
  section: st.rsvp,
  heading: st.h2,
  note: st.muted,
  form: st.form,
  label: st.label,
  input: st.input,
  error: st.error,
  success: st.success,
  buttons: st.buttons,
  yes: st.yes,
  no: st.no,
};

function Hero() {
  const { t, event, date } = useInvitation();
  const c = event.content;
  return (
    <header className={st.hero}>
      <Florals />
      <div className={st.heading}>
        <OptionalText className={st.eyebrow}>{t(c.eyebrow)}</OptionalText>
        <h1 className={st.name}>{t(c.names)}</h1>
        <span className={st.date}>{cap(date({ weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</span>
      </div>
      <div className={st.oval} data-reveal>
        <Photo slot="hero" className={st.ovalImg} priority />
      </div>
    </header>
  );
}

function Welcome() {
  const { t, event } = useInvitation();
  const c = event.content;
  return (
    <section className={st.welcome} data-reveal>
      <Multiline text={t(c.welcome?.text)} className={st.welcomeText} />
      <OptionalText className={st.organizer}>{t(c.organizer)}</OptionalText>
    </section>
  );
}

function Godparents() {
  const { t, event } = useInvitation();
  const g = event.content.godparents;
  if (!t(g?.names)) return null;
  return (
    <section className={st.godparents} data-reveal>
      <span className={st.smallCaps}>{t(g?.heading)}</span>
      <span className={st.godparentNames}>{t(g?.names)}</span>
    </section>
  );
}

function Countdown() {
  const { t, s, event } = useInvitation();
  const c = useCountdown({ units: ["days", "hours", "minutes"] });
  return (
    <section className={st.countdown} data-reveal>
      <h2 className={st.countdownHeading}>{c.done ? s.countdownDone : t(event.content.countdown?.heading)}</h2>
      {!c.done && (
        <div className={st.countdownRow} role="timer">
          <CountdownUnits units={c.units} classes={{ item: st.countdownItem, num: st.countdownNum, unit: st.countdownUnit }} />
        </div>
      )}
    </section>
  );
}

function Program() {
  const { t, event, s } = useInvitation();
  const p = event.content.program;
  return (
    <section className={st.program}>
      <h2 className={st.h2}>{t(p?.heading) || s.program}</h2>
      <div className={st.programGrid}>
        {p?.items.map((item) => (
          <div key={item.id} className={st.programCard} data-reveal>
            <span className={st.programTime}>{item.time}</span>
            <span className={st.programTitle}>{t(item.title)}</span>
            <OptionalText className={st.programPlace}>{t(item.place)}</OptionalText>
          </div>
        ))}
      </div>
    </section>
  );
}

function Rsvp() {
  const { s } = useInvitation();
  return (
    <RsvpSection id="chr-rsvp" classes={rsvpClasses}>
      {(f) => (
        <>
          <RsvpNameField f={f} classes={rsvpClasses} />
          <RsvpCountField f={f} field="guestCount" label={s.guestCount} min={1} classes={rsvpClasses} />
          <RsvpResult f={f} classes={rsvpClasses} />
          <RsvpYesNoButtons f={f} classes={rsvpClasses} />
        </>
      )}
    </RsvpSection>
  );
}

function Location() {
  const { t, s } = useInvitation();
  const { heading, venues } = useVenues();
  if (!venues.length) return null;
  return (
    <section className={st.location} data-reveal>
      <OptionalText as="h2" className={st.h2}>
        {heading}
      </OptionalText>
      <MapFrame venue={venues[0]} classes={{ wrap: st.mapWrap, map: st.map }} />
      <div className={venues.length > 1 ? st.venueButtons : st.venueButtonsSingle}>
        {venues.map((v) => (
          <MapsLink key={v.id} venue={v} className={st.venueButton}>
            {t(v.label) || (venues.length > 1 ? t(v.name) : s.directions)}
          </MapsLink>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const f = useFooter();
  return (
    <footer className={st.footer}>
      <FooterLine />
      <span className={st.footerName}>{f.text || f.names}</span>
      <OptionalText className={st.muted}>{f.contact}</OptionalText>
    </footer>
  );
}

/** Classic Christening / Floral Baptism — FloralChristening.dc.html. */
export default function Christening() {
  return (
    <TemplateShell
      classes={{ page: st.page, phone: st.phone }}
      hero={<Hero />}
      sections={{
        welcome: () => <Welcome />,
        godparents: () => <Godparents />,
        countdown: () => <Countdown />,
        program: () => <Program />,
        rsvp: () => <Rsvp />,
        location: () => <Location />,
        footer: () => <Footer />,
      }}
    />
  );
}
