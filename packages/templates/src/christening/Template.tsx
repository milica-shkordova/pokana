import { Fragment } from "react";
import type { SectionKind } from "@pokanito/shared";
import { useInvitation } from "../engine/runtime";
import { useCountdown, useRsvpDeadlineText } from "../engine/hooks";
import { useRsvpForm } from "../engine/useRsvpForm";
import { LanguageToggle, MapEmbed, MapsLink, Multiline, MusicButton, Photo, PreviewNotice } from "../engine/components";
import { cap } from "../common/format";
import st from "./Template.module.scss";

function Florals() {
  return (
    <svg className={st.florals} viewBox="0 0 390 120" fill="none" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <path d="M0 40 C60 30 90 70 150 60" />
      <path d="M40 36c-6-14 4-22 12-24 2 10-4 20-12 24zM90 52c10-10 22-8 28-2-8 8-20 8-28 2z" />
      <circle cx="150" cy="60" r="6" className={st.petal} />
      <circle cx="160" cy="54" r="4" className={st.petal} />
      <path d="M390 30 C330 24 300 62 240 54" />
      <path d="M350 28c6-14-4-22-12-24-2 10 4 20 12 24zM300 46c-10-10-22-8-28-2 8 8 20 8 28 2z" />
      <circle cx="240" cy="54" r="6" className={st.petal} />
      <circle cx="230" cy="48" r="4" className={st.petal} />
    </svg>
  );
}

function Hero() {
  const { t, event, date } = useInvitation();
  const c = event.content;
  return (
    <header className={st.hero}>
      <Florals />
      <div className={st.heading}>
        {t(c.eyebrow) && <span className={st.eyebrow}>{t(c.eyebrow)}</span>}
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
      {t(c.organizer) && <span className={st.organizer}>{t(c.organizer)}</span>}
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
  const c = useCountdown();
  return (
    <section className={st.countdown} data-reveal>
      <h2 className={st.countdownHeading}>{c.done ? s.countdownDone : t(event.content.countdown?.heading)}</h2>
      {!c.done && (
        <div className={st.countdownRow} role="timer">
          {(
            [
              [c.days, s.days],
              [c.hours, s.hours],
              [c.minutes, s.minutes],
            ] as const
          ).map(([n, unit], i) => (
            <div key={unit} className={st.countdownItem}>
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
      <div className={st.programGrid}>
        {p?.items.map((item) => (
          <div key={item.id} className={st.programCard} data-reveal>
            <span className={st.programTime}>{item.time}</span>
            <span className={st.programTitle}>{t(item.title)}</span>
            {t(item.place) && <span className={st.programPlace}>{t(item.place)}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Rsvp() {
  const { t, s, event } = useInvitation();
  const f = useRsvpForm();
  const deadline = useRsvpDeadlineText();
  return (
    <section className={st.rsvp} aria-labelledby="chr-rsvp">
      <h2 id="chr-rsvp" className={st.h2}>
        {t(event.content.rsvp?.heading) || s.rsvpHeading}
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
          <label className={st.label}>
            {s.name}
            <input className={st.input} value={f.fields.name} onChange={(e) => f.set("name", e.target.value)} autoComplete="name" />
          </label>
          {f.error("name") && <span className={st.error}>{f.error("name")}</span>}
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

function Location() {
  const { t, s, event } = useInvitation();
  const venues = event.content.location?.venues ?? [];
  if (!venues.length) return null;
  return (
    <section className={st.location} data-reveal>
      {t(event.content.location?.heading) && <h2 className={st.h2}>{t(event.content.location?.heading)}</h2>}
      <div className={st.mapWrap}>
        <MapEmbed venue={venues[0]} className={st.map} />
      </div>
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
  const { t, event } = useInvitation();
  const c = event.content;
  return (
    <footer className={st.footer}>
      <svg width="60" height="24" viewBox="0 0 60 24" fill="none" strokeWidth="1.4" strokeLinecap="round" aria-hidden className={st.footerLine}>
        <path d="M2 12h56" />
        <circle cx="30" cy="12" r="5" className={st.petal} />
      </svg>
      <span className={st.footerName}>{t(c.footer?.text) || t(c.names)}</span>
      {t(c.footer?.contact) && <span className={st.muted}>{t(c.footer?.contact)}</span>}
    </footer>
  );
}

/** Classic Christening / Floral Baptism — FloralChristening.dc.html. */
export default function Christening() {
  const { sections, themeStyle } = useInvitation();
  const render: Partial<Record<SectionKind, () => JSX.Element | null>> = {
    welcome: () => <Welcome />,
    godparents: () => <Godparents />,
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
