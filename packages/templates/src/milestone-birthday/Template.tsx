import { useInvitation } from "../engine/runtime";
import { useCountdown, useFooter, useVenues } from "../engine/hooks";
import { CountdownUnits, MapsLink, Multiline, OptionalText, Photo } from "../engine/components";
import { RsvpNameField, RsvpResult, RsvpSection, RsvpSubmitDecline, type RsvpClasses } from "../engine/rsvp";
import { TemplateShell } from "../engine/TemplateShell";
import { cap, dateParts, TIME } from "../engine/format";
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
  submit: st.submit,
  decline: st.decline,
};

function Hero() {
  const { t, event, date } = useInvitation();
  const c = event.content;
  const dp = dateParts(event.eventDate);
  return (
    <header className={st.hero}>
      <OptionalText className={st.eyebrow}>{t(c.eyebrow)}</OptionalText>
      {c.age !== undefined && (
        <span className={st.age} aria-hidden>
          {c.age}
        </span>
      )}
      <h1 className={st.name}>
        {t(c.names)}
        {c.age !== undefined && <span className="pokanito-sr-only"> · {c.age}</span>}
      </h1>
      <span className={st.rule} aria-hidden />
      <span className={st.when}>
        {cap(date({ weekday: "long" }))} · {dp.d}.{dp.m}.{dp.y} · {date(TIME)}
      </span>
      <div className={st.photos}>
        <div className={st.photoThen} data-reveal>
          <Photo slot="then" className={st.photoImg} sizes="200px" />
        </div>
        <div className={st.photoNow} data-reveal style={{ ["--reveal-delay" as string]: "0.15s" }}>
          <Photo slot="now" className={st.photoImg} sizes="200px" />
        </div>
      </div>
    </header>
  );
}

function Welcome() {
  const { t, event } = useInvitation();
  return (
    <section className={st.welcome} data-reveal>
      <Multiline text={t(event.content.welcome?.text)} className={st.welcomeText} />
    </section>
  );
}

function Countdown() {
  const { t, s, event } = useInvitation();
  const c = useCountdown();
  return (
    <section className={st.countdown} data-reveal>
      <span className={st.smallCaps}>{c.done ? s.countdownDone : t(event.content.countdown?.heading)}</span>
      {!c.done && (
        <div className={st.countdownGrid} role="timer">
          <CountdownUnits units={c.units} classes={{ item: st.countdownCell, num: st.countdownNum, unit: st.countdownUnit }} />
        </div>
      )}
    </section>
  );
}

function Info() {
  const { t, event } = useInvitation();
  const items = event.content.info?.items ?? [];
  if (!items.length) return null;
  return (
    <section className={st.info}>
      {items.map((it) => (
        <div key={it.id} className={st.infoCard} data-reveal>
          <span className={st.infoLabel}>{t(it.label)}</span>
          <span className={st.infoTitle}>{t(it.title)}</span>
          <OptionalText className={st.infoText}>{t(it.text)}</OptionalText>
        </div>
      ))}
    </section>
  );
}

function Rsvp() {
  const { s } = useInvitation();
  return (
    <RsvpSection id="ms-rsvp" classes={rsvpClasses}>
      {(f) => (
        <>
          <RsvpNameField f={f} classes={rsvpClasses} />
          <label className={st.label}>
            {s.plusOne}
            <select className={st.input} value={f.fields.plusOne ? "1" : "0"} onChange={(e) => f.set("plusOne", e.target.value === "1")}>
              <option value="0">{s.justMe}</option>
              <option value="1">{s.meAndOne}</option>
            </select>
          </label>
          <RsvpResult f={f} classes={rsvpClasses} />
          <RsvpSubmitDecline f={f} classes={rsvpClasses} />
        </>
      )}
    </RsvpSection>
  );
}

function Location() {
  const { t, s } = useInvitation();
  const { heading, venues } = useVenues();
  return (
    <section className={st.location}>
      <OptionalText className={st.infoLabel}>{heading}</OptionalText>
      {venues.map((v) => (
        <div key={v.id} className={st.venue} data-reveal>
          <OptionalText className={st.muted}>{t(v.label)}</OptionalText>
          <span className={st.venueName}>{t(v.name)}</span>
          <span className={st.muted}>{t(v.address)}</span>
          <MapsLink venue={v} className={st.mapLink}>
            {s.openInMaps}
          </MapsLink>
        </div>
      ))}
    </section>
  );
}

function Footer() {
  const { event } = useInvitation();
  const f = useFooter();
  const age = event.content.age;
  return (
    <footer className={st.footer}>
      <span className={st.footerTitle}>{f.text}</span>
      <span className={st.footerSign}>
        {f.names.toLocaleUpperCase()}
        {age !== undefined && ` · ${age}`}
      </span>
      <OptionalText className={st.muted}>{f.contact}</OptionalText>
    </footer>
  );
}

/** Milestone Birthday — MilestoneBirthday.dc.html. */
export default function MilestoneBirthday() {
  return (
    <TemplateShell
      classes={{ page: st.page, phone: st.phone }}
      hero={<Hero />}
      sections={{
        welcome: () => <Welcome />,
        countdown: () => <Countdown />,
        info: () => <Info />,
        rsvp: () => <Rsvp />,
        location: () => <Location />,
        footer: () => <Footer />,
      }}
    />
  );
}
