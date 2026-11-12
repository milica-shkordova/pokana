import { Fragment } from "react";
import type { SectionKind } from "@pokanito/shared";
import { useInvitation } from "../engine/runtime";
import { useCountdown, useRsvpDeadlineText } from "../engine/hooks";
import { useRsvpForm } from "../engine/useRsvpForm";
import { LanguageToggle, MapEmbed, MapsLink, Multiline, MusicButton, Photo, PreviewNotice } from "../engine/components";
import { cap, pick, TIME } from "../common/format";
import st from "./Template.module.scss";

const COPY = {
  mk: { when: "КОГА", where: "КАДЕ" },
  en: { when: "WHEN", where: "WHERE" },
};

const PILL_COLORS = ["#FFD866", "#FF7A59", "#7ED6B5"];

function Hero() {
  const { t, event } = useInvitation();
  const c = event.content;
  return (
    <header className={st.hero}>
      <span aria-hidden className={st.blobCoral} />
      <span aria-hidden className={st.blobMint} />
      <span aria-hidden className={st.blobPop} />
      {t(c.eyebrow) && <span className={st.eyebrow}>{t(c.eyebrow)}</span>}
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
      <svg className={st.wave} viewBox="0 0 390 40" preserveAspectRatio="none" aria-hidden>
        <path d="M0 20 Q 24 0 48 20 T 96 20 T 144 20 T 192 20 T 240 20 T 288 20 T 336 20 T 384 20 T 432 20 V40 H0 Z" fill="#FFFFFF" />
      </svg>
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
  const c = useCountdown();
  return (
    <section className={st.white}>
      <div className={st.countdown} data-reveal>
        <h2 className={st.h2small}>{c.done ? s.countdownDone : t(event.content.countdown?.heading)}</h2>
        {!c.done && (
          <div className={st.countdownRow} role="timer">
            {(
              [
                [c.days, s.days],
                [c.hours, s.hours],
                [c.minutes, s.minutes],
              ] as const
            ).map(([n, unit]) => (
              <div key={unit} className={st.countdownItem}>
                <span className={st.countdownNum}>{c.ready ? String(n).padStart(2, "0") : "–"}</span>
                <span className={st.countdownUnit}>{unit}</span>
              </div>
            ))}
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
              {t(item.place) && <span className={st.programPlace}>{t(item.place)}</span>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Rsvp() {
  const { t, s, event } = useInvitation();
  const f = useRsvpForm();
  const deadline = useRsvpDeadlineText();
  const heading = t(event.content.rsvp?.heading) || s.rsvpHeading;

  return (
    <section className={st.rsvp} aria-labelledby="kids-rsvp">
      <h2 id="kids-rsvp" className={st.rsvpTitle}>
        {heading}
      </h2>
      {!f.open ? (
        <p className={st.rsvpNote}>{s.rsvpClosed}</p>
      ) : (
        <form
          className={st.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void f.submitAs(true);
          }}
        >
          {(deadline || t(event.content.rsvp?.note)) && <p className={st.rsvpNote}>{t(event.content.rsvp?.note) || deadline}</p>}
          <label className={st.label}>
            {s.childName}
            <input className={st.input} value={f.fields.name} onChange={(e) => f.set("name", e.target.value)} autoComplete="name" />
          </label>
          {f.error("name") && <span className={st.error}>{f.error("name")}</span>}
          <div className={st.grid2}>
            <label className={st.label}>
              {s.children}
              <input
                className={st.input}
                type="number"
                inputMode="numeric"
                min={0}
                value={f.fields.children}
                onChange={(e) => f.set("children", Math.max(0, Number(e.target.value) || 0))}
              />
            </label>
            <label className={st.label}>
              {s.adults}
              <input
                className={st.input}
                type="number"
                inputMode="numeric"
                min={0}
                value={f.fields.adults}
                onChange={(e) => f.set("adults", Math.max(0, Number(e.target.value) || 0))}
              />
            </label>
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

function Location() {
  const { t, s, event } = useInvitation();
  const venues = event.content.location?.venues ?? [];
  return (
    <section className={st.location}>
      {t(event.content.location?.heading) && <h2 className={st.h2small}>{t(event.content.location?.heading)}</h2>}
      {venues.map((v) => (
        <div key={v.id} className={st.venue} data-reveal>
          <div className={st.mapWrap}>
            <MapEmbed venue={v} className={st.map} />
          </div>
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
  const { t, event } = useInvitation();
  const f = event.content.footer;
  return (
    <footer className={st.footer}>
      <span className={st.footerTitle}>{t(f?.text)}</span>
      {(t(f?.contact) || t(event.content.organizer)) && <span className={st.footerContact}>{t(f?.contact) || t(event.content.organizer)}</span>}
    </footer>
  );
}

export default function KidsBirthday() {
  const { sections, themeStyle } = useInvitation();
  const render: Partial<Record<SectionKind, () => JSX.Element>> = {
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
