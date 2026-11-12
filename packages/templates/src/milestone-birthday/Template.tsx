import { Fragment } from "react";
import { pad2, type SectionKind } from "@pokanito/shared";
import { useInvitation } from "../engine/runtime";
import { useCountdown, useRsvpDeadlineText } from "../engine/hooks";
import { useRsvpForm } from "../engine/useRsvpForm";
import { LanguageToggle, MapsLink, Multiline, MusicButton, Photo, PreviewNotice } from "../engine/components";
import { cap, dateParts, TIME } from "../common/format";
import st from "./Template.module.scss";

function Hero() {
  const { t, event, date } = useInvitation();
  const c = event.content;
  const dp = dateParts(event.eventDate);
  return (
    <header className={st.hero}>
      {t(c.eyebrow) && <span className={st.eyebrow}>{t(c.eyebrow)}</span>}
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
          {(
            [
              [c.days, s.days],
              [c.hours, s.hours],
              [c.minutes, s.minutes],
              [c.seconds, s.seconds],
            ] as const
          ).map(([n, unit], i) => (
            <div key={unit} className={st.countdownCell}>
              <span className={st.countdownNum}>{c.ready ? (i === 0 ? n : pad2(n)) : "–"}</span>
              <span className={st.countdownUnit}>{unit}</span>
            </div>
          ))}
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
          {t(it.text) && <span className={st.infoText}>{t(it.text)}</span>}
        </div>
      ))}
    </section>
  );
}

function Rsvp() {
  const { t, s, event } = useInvitation();
  const f = useRsvpForm();
  const deadline = useRsvpDeadlineText();
  return (
    <section className={st.rsvp} aria-labelledby="ms-rsvp">
      <h2 id="ms-rsvp" className={st.h2}>
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
            {s.plusOne}
            <select className={st.input} value={f.fields.plusOne ? "1" : "0"} onChange={(e) => f.set("plusOne", e.target.value === "1")}>
              <option value="0">{s.justMe}</option>
              <option value="1">{s.meAndOne}</option>
            </select>
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
  const loc = event.content.location;
  return (
    <section className={st.location}>
      {t(loc?.heading) && <span className={st.infoLabel}>{t(loc?.heading)}</span>}
      {loc?.venues.map((v) => (
        <div key={v.id} className={st.venue} data-reveal>
          {t(v.label) && <span className={st.muted}>{t(v.label)}</span>}
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
  const { t, event } = useInvitation();
  const c = event.content;
  return (
    <footer className={st.footer}>
      <span className={st.footerTitle}>{t(c.footer?.text)}</span>
      <span className={st.footerSign}>
        {t(c.names).toLocaleUpperCase()}
        {c.age !== undefined && ` · ${c.age}`}
      </span>
      {t(c.footer?.contact) && <span className={st.muted}>{t(c.footer?.contact)}</span>}
    </footer>
  );
}

/** Milestone Birthday — MilestoneBirthday.dc.html. */
export default function MilestoneBirthday() {
  const { sections, themeStyle } = useInvitation();
  const render: Partial<Record<SectionKind, () => JSX.Element | null>> = {
    welcome: () => <Welcome />,
    countdown: () => <Countdown />,
    info: () => <Info />,
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
