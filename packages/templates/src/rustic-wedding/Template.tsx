import { Fragment } from "react";
import type { SectionKind } from "@pokanito/shared";
import { useInvitation } from "../engine/runtime";
import { useCountdown, useRsvpDeadlineText } from "../engine/hooks";
import { useRsvpForm } from "../engine/useRsvpForm";
import { LanguageToggle, MapsLink, Multiline, MusicButton, Photo, PreviewNotice } from "../engine/components";
import { dateParts } from "../common/format";
import st from "./Template.module.scss";

function Sprig({ full = true }: { full?: boolean }) {
  return (
    <svg className={st.sprig} width="120" height="28" viewBox="0 0 120 28" fill="none" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
      <path d="M4 14h112" />
      <path d="M60 14c-6-8-14-10-20-8 4 6 12 8 20 8zM60 14c6-8 14-10 20-8-4 6-12 8-20 8z" />
      {full && <path d="M40 14c-4-5-9-6-13-5 3 4 8 5 13 5zM80 14c4-5 9-6 13-5-3 4-8 5-13 5z" />}
    </svg>
  );
}

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
        {t(c.eyebrow) && <span className={st.eyebrow}>{t(c.eyebrow)}</span>}
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
            {t(item.place) && <span className={st.timelinePlace}>{t(item.place)}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Rsvp() {
  const { t, s, event, photo, preview } = useInvitation();
  const f = useRsvpForm();
  const deadline = useRsvpDeadlineText();
  return (
    <>
      {(photo("nature") || preview) && (
        <div className={st.band}>
          <Photo slot="nature" className={st.bandImg} />
        </div>
      )}
      <section className={st.rsvp} aria-labelledby="rustic-rsvp">
        <h2 id="rustic-rsvp" className={st.h2}>
          {t(event.content.rsvp?.heading) || s.rsvpHeading}
        </h2>
        {!f.open ? (
          <p className={st.muted}>{s.rsvpClosed}</p>
        ) : (
          <form className={st.form} onSubmit={f.submit} noValidate>
            {(t(event.content.rsvp?.note) || deadline) && <p className={st.muted}>{t(event.content.rsvp?.note) || deadline}</p>}
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
            <label className={st.label}>
              {s.name}
              <input className={st.input} value={f.fields.name} onChange={(e) => f.set("name", e.target.value)} autoComplete="name" />
            </label>
            {f.error("name") && <span className={st.error}>{f.error("name")}</span>}
            {f.attending && (
              <label className={st.label}>
                {s.guestCount}
                <input
                  className={st.input}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={f.fields.guestCount}
                  onChange={(e) => f.set("guestCount", Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
            )}
            {f.resultText && (
              <p className={f.failed ? st.error : st.success} role="status">
                {f.resultText}
              </p>
            )}
            <button type="submit" className={st.submit} disabled={f.sending}>
              {f.submitLabel}
            </button>
          </form>
        )}
      </section>
    </>
  );
}

function Location() {
  const { t, s, event } = useInvitation();
  return (
    <>
      {event.content.location?.venues.map((v) => (
        <section key={v.id} className={st.venue} data-reveal>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" aria-hidden className={st.pin}>
            <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {t(v.label) && <span className={st.muted}>{t(v.label)}</span>}
          <h2 className={st.venueName}>{t(v.name)}</h2>
          <span className={st.muted}>{t(v.address)}</span>
          {t(v.note) && <span className={st.muted}>{t(v.note)}</span>}
          <MapsLink venue={v} className={st.mapsLink}>
            {s.openInMaps}
          </MapsLink>
        </section>
      ))}
    </>
  );
}

function Footer() {
  const { t, event } = useInvitation();
  const c = event.content;
  return (
    <footer className={st.footer}>
      <Sprig full={false} />
      <span className={st.footerNames}>{t(c.footer?.text) || t(c.names)}</span>
      {t(c.footer?.contact) && <span className={st.muted}>{t(c.footer?.contact)}</span>}
    </footer>
  );
}

/** Rustic Wedding — RusticWedding.dc.html. */
export default function RusticWedding() {
  const { sections, themeStyle } = useInvitation();
  const render: Partial<Record<SectionKind, () => JSX.Element | null>> = {
    welcome: () => <Welcome />,
    countdown: () => <Countdown />,
    program: () => <Program />,
    rsvp: () => <Rsvp />,
    location: () => <Location />,
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
