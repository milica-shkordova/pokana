import { useInvitation } from "../engine/runtime";
import { useCountdown, useFooter, useVenues } from "../engine/hooks";
import { CountdownUnits, MapFrame, MapsLink, Multiline, OptionalText, Photo } from "../engine/components";
import { RsvpCountField, RsvpNameField, RsvpResult, RsvpSection, RsvpSubmitDecline, type RsvpClasses } from "../engine/rsvp";
import { TemplateShell } from "../engine/TemplateShell";
import { cap, pick, TIME } from "../engine/format";
import { COPY } from "./copy";
import { PILL_COLORS } from "./constants";
import { Wave } from "./ornaments";
import st from "./Template.module.scss";

const rsvpClasses: RsvpClasses = {
  section: st.rsvp,
  heading: st.rsvpTitle,
  note: st.rsvpNote,
  form: st.form,
  label: st.label,
  input: st.input,
  error: st.error,
  success: st.success,
  submit: st.submit,
  decline: st.decline,
};

function Hero() {
  const { t, event } = useInvitation();
  const c = event.content;
  return (
    <header className={st.hero}>
      <span aria-hidden className={st.blobCoral} />
      <span aria-hidden className={st.blobMint} />
      <span aria-hidden className={st.blobPop} />
      <OptionalText className={st.eyebrow}>{t(c.eyebrow)}</OptionalText>
      <h1 className={st.title}>
        {t(c.names)}
        {t(c.tagline) && (
          <>
            <br />
            {t(c.tagline)}
          </>
        )}
      </h1>
      {c.age !== undefined && <span className={st.age}>{c.age}</span>}
      <div className={st.photoRing} data-reveal>
        <Photo slot="hero" className={st.photo} priority />
      </div>
      <Wave />
    </header>
  );
}

function Welcome() {
  const { t, event, date, locale } = useInvitation();
  const c = event.content;
  const venue = c.location?.venues[0];
  const copy = pick(COPY, locale);
  return (
    <section className={`${st.white} ${st.stack}`}>
      <Multiline text={t(c.welcome?.text)} className={st.welcome} />
      <div className={st.cards} data-reveal>
        <div className={st.whenCard}>
          <span className={st.cardLabel}>{copy.when}</span>
          <span className={st.cardValue}>{date({ day: "numeric", month: "short" })}</span>
          <span className={st.cardSub}>
            {cap(date({ weekday: "long" }))}, {date(TIME)}
          </span>
        </div>
        <div className={st.whereCard}>
          <span className={st.cardLabel}>{copy.where}</span>
          <span className={st.cardValue}>{venue ? t(venue.name) : t(c.city)}</span>
          <span className={st.cardSub}>{venue ? t(venue.address) : ""}</span>
        </div>
      </div>
    </section>
  );
}

function Countdown() {
  const { t, s, event } = useInvitation();
  const c = useCountdown({ units: ["days", "hours", "minutes"], pad: "all" });
  return (
    <section className={st.white}>
      <div className={st.countdown} data-reveal>
        <h2 className={st.h2small}>{c.done ? s.countdownDone : t(event.content.countdown?.heading)}</h2>
        {!c.done && (
          <div className={st.countdownRow} role="timer">
            <CountdownUnits units={c.units} classes={{ item: st.countdownItem, num: st.countdownNum, unit: st.countdownUnit }} />
          </div>
        )}
      </div>
    </section>
  );
}

function Program() {
  const { t, event } = useInvitation();
  const p = event.content.program;
  return (
    <section className={`${st.white} ${st.stack}`}>
      <h2 className={st.h2small}>{t(p?.heading)}</h2>
      <ol className={st.program}>
        {p?.items.map((item, i) => (
          <li key={item.id} className={st.programItem} data-reveal style={{ ["--reveal-delay" as string]: `${i * 0.08}s` }}>
            <span className={st.pill} style={{ background: PILL_COLORS[i % PILL_COLORS.length] }}>
              {item.time}
            </span>
            <span className={st.programTitle}>
              {t(item.title)}
              <OptionalText className={st.programPlace}>{t(item.place)}</OptionalText>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Rsvp() {
  const { s } = useInvitation();
  return (
    <RsvpSection id="kids-rsvp" classes={rsvpClasses}>
      {(f) => (
        <>
          <RsvpNameField f={f} classes={rsvpClasses} label={s.childName} />
          <div className={st.grid2}>
            <RsvpCountField f={f} field="children" label={s.children} min={0} classes={rsvpClasses} />
            <RsvpCountField f={f} field="adults" label={s.adults} min={0} classes={rsvpClasses} />
          </div>
          <label className={st.label}>
            {s.allergies}
            <input
              className={st.input}
              placeholder={s.allergiesPlaceholder}
              value={f.fields.allergies}
              onChange={(e) => f.set("allergies", e.target.value)}
            />
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
      <OptionalText as="h2" className={st.h2small}>
        {heading}
      </OptionalText>
      {venues.map((v) => (
        <div key={v.id} className={st.venue} data-reveal>
          <MapFrame venue={v} classes={{ wrap: st.mapWrap, map: st.map }} />
          {venues.length > 1 && <span className={st.venueName}>{t(v.label) || t(v.name)}</span>}
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
      <span className={st.footerTitle}>{f.text}</span>
      <OptionalText className={st.footerContact}>{f.contact || f.organizer}</OptionalText>
    </footer>
  );
}

/** Kids Birthday — KidsBirthday.dc.html. */
export default function KidsBirthday() {
  return (
    <TemplateShell
      classes={{ page: st.page, phone: st.phone }}
      hero={<Hero />}
      sections={{
        welcome: () => <Welcome />,
        countdown: () => <Countdown />,
        program: () => <Program />,
        rsvp: () => <Rsvp />,
        location: () => <Location />,
        footer: () => <Footer />,
      }}
    />
  );
}
