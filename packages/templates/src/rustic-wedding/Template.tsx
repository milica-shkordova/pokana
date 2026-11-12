import { useInvitation } from "../engine/runtime";
import { useCountdown, useFooter, useVenues } from "../engine/hooks";
import { CountdownUnits, MapsLink, Multiline, OptionalText, Photo } from "../engine/components";
import { RsvpCountField, RsvpNameField, RsvpResult, RsvpSection, type RsvpClasses } from "../engine/rsvp";
import { TemplateShell } from "../engine/TemplateShell";
import { dateParts } from "../engine/format";
import { Pin, Sprig } from "./ornaments";
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
};

function Hero() {
  const { t, event } = useInvitation();
  const c = event.content;
  const dp = dateParts(event.eventDate);
  const one = t(c.partnerOne);
  const two = t(c.partnerTwo);
  return (
    <header className={st.hero}>
      <div className={st.heading}>
        <Sprig />
        <OptionalText className={st.eyebrow}>{t(c.eyebrow)}</OptionalText>
        <h1 className={st.names}>
          {one && two ? (
            <>
              {one}
              <br />
              <span className={st.amp}>&amp;</span>
              <br />
              {two}
            </>
          ) : (
            t(c.names)
          )}
        </h1>
        <span className={st.date}>{[dp.d, dp.m, dp.y].join(" · ")}</span>
      </div>
      <div className={st.arch} data-reveal>
        <Photo slot="hero" className={st.archImg} priority />
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
    <section className={st.countdown}>
      <h2 className={st.countdownHeading}>{c.done ? s.countdownDone : t(event.content.countdown?.heading)}</h2>
      {!c.done && (
        <div className={st.countdownGrid} role="timer" data-reveal>
          <CountdownUnits units={c.units} classes={{ item: st.countdownBox, num: st.countdownNum, unit: st.countdownUnit }} />
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
      <ol className={st.timeline}>
        {p?.items.map((item) => (
          <li key={item.id} className={st.timelineItem} data-reveal>
            <span className={st.timelineDot} aria-hidden />
            <span className={st.timelineTime}>{item.time}</span>
            <span className={st.timelineTitle}>{t(item.title)}</span>
            <OptionalText className={st.timelinePlace}>{t(item.place)}</OptionalText>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Rsvp() {
  const { s, photo, preview } = useInvitation();
  return (
    <>
      {(photo("nature") || preview) && (
        <div className={st.band}>
          <Photo slot="nature" className={st.bandImg} />
        </div>
      )}
      <RsvpSection id="rustic-rsvp" classes={rsvpClasses} submit="choice">
        {(f) => (
          <>
            <div className={st.choice} role="radiogroup">
              <label className={f.attending ? st.choiceOn : st.choiceOff}>
                <input type="radio" name="rustic-attending" checked={f.attending} onChange={() => f.setAttending(true)} />
                {s.attending}
              </label>
              <label className={!f.attending ? st.choiceOn : st.choiceOff}>
                <input type="radio" name="rustic-attending" checked={!f.attending} onChange={() => f.setAttending(false)} />
                {s.notAttending}
              </label>
            </div>
            <RsvpNameField f={f} classes={rsvpClasses} />
            {f.attending && <RsvpCountField f={f} field="guestCount" label={s.guestCount} min={1} classes={rsvpClasses} />}
            <RsvpResult f={f} classes={rsvpClasses} />
            <button type="submit" className={st.submit} disabled={f.sending}>
              {f.submitLabel}
            </button>
          </>
        )}
      </RsvpSection>
    </>
  );
}

function Location() {
  const { t, s } = useInvitation();
  const { venues } = useVenues();
  return (
    <>
      {venues.map((v) => (
        <section key={v.id} className={st.venue} data-reveal>
          <Pin />
          <OptionalText className={st.muted}>{t(v.label)}</OptionalText>
          <h2 className={st.venueName}>{t(v.name)}</h2>
          <span className={st.muted}>{t(v.address)}</span>
          <OptionalText className={st.muted}>{t(v.note)}</OptionalText>
          <MapsLink venue={v} className={st.mapsLink}>
            {s.openInMaps}
          </MapsLink>
        </section>
      ))}
    </>
  );
}

function Footer() {
  const f = useFooter();
  return (
    <footer className={st.footer}>
      <Sprig full={false} />
      <span className={st.footerNames}>{f.text || f.names}</span>
      <OptionalText className={st.muted}>{f.contact}</OptionalText>
    </footer>
  );
}

/** Rustic Wedding — RusticWedding.dc.html. */
export default function RusticWedding() {
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
