import { Fragment } from "react";
import { pad2 } from "@pokanito/shared";
import { useInvitation } from "../engine/runtime";
import { useCountdown, useFooter, useVenues } from "../engine/hooks";
import { MapFrame, MapsLink, Multiline, Photo } from "../engine/components";
import { RsvpResult, RsvpSection, RsvpYesNoButtons, type RsvpClasses } from "../engine/rsvp";
import { TemplateShell } from "../engine/TemplateShell";
import { dateParts, initials, pick } from "../engine/format";
import { COPY } from "./copy";
import st from "./Template.module.scss";

const rsvpClasses: RsvpClasses = {
  section: st.section,
  heading: st.h2,
  note: st.muted,
  form: st.form,
  error: st.error,
  success: st.success,
  buttons: st.buttons,
  yes: st.yes,
  no: st.no,
};

/** Numbered section label: "02 — Програма". */
function Label({ n, text }: { n: number; text: string }) {
  return (
    <span className={st.label}>
      {pad2(n)} — {text}
    </span>
  );
}

function Hero() {
  const { t, event, locale } = useInvitation();
  const c = event.content;
  const dp = dateParts(event.eventDate);
  const one = t(c.partnerOne);
  const two = t(c.partnerTwo);
  return (
    <header>
      <div className={st.topRow}>
        <span>{t(c.eyebrow)}</span>
        <span>{t(c.city)}</span>
      </div>
      <div className={st.bigDate} aria-label={`${dp.d}.${dp.m}.${dp.y}`}>
        <span>{dp.d}</span>
        <span className={st.accent}>{dp.m}</span>
        <span>{dp.yy}</span>
      </div>
      <h1 className={st.names}>
        {one && two ? (
          <>
            <span>{one}</span>
            <span className={st.and}>{pick(COPY, locale).joiner}</span>
            <span>{two}</span>
          </>
        ) : (
          <span>{t(c.names)}</span>
        )}
      </h1>
      <div className={st.hero} data-reveal>
        <Photo slot="hero" className={st.heroImg} priority />
      </div>
    </header>
  );
}

function Welcome({ n }: { n: number }) {
  const { t, event } = useInvitation();
  const w = event.content.welcome;
  return (
    <section className={st.section} data-reveal>
      <Label n={n} text={t(w?.heading)} />
      <Multiline text={t(w?.text)} className={st.lead} />
    </section>
  );
}

function Countdown() {
  const { t, s, event, locale } = useInvitation();
  const c = useCountdown({ units: ["days", "hours", "minutes"], pad: "none" });
  const [days, hours, minutes] = c.units;
  const copy = pick(COPY, locale);
  return (
    <section className={st.countdown} data-reveal>
      {c.done ? (
        <span className={st.countdownText}>{s.countdownDone}</span>
      ) : (
        <>
          <span className={st.countdownNum}>{days.value}</span>
          <span className={st.countdownText}>
            {copy.days}, {hours.value} {copy.hours} {copy.and} {minutes.value} {copy.minutes}
            <br />
            {t(event.content.countdown?.heading)}
          </span>
        </>
      )}
    </section>
  );
}

function Program({ n }: { n: number }) {
  const { t, event, s } = useInvitation();
  const p = event.content.program;
  return (
    <section className={st.section}>
      <Label n={n} text={t(p?.heading) || s.program} />
      <dl className={st.program}>
        {p?.items.map((item) => (
          <Fragment key={item.id}>
            <dt className={st.programTime} data-reveal>
              {item.time}
            </dt>
            <dd data-reveal>
              {t(item.title)}
              {t(item.place) && (
                <>
                  <br />
                  <span className={st.muted}>{t(item.place)}</span>
                </>
              )}
            </dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}

function Rsvp({ n }: { n: number }) {
  const { t, s, event } = useInvitation();
  return (
    <RsvpSection
      id="min-rsvp"
      classes={rsvpClasses}
      heading={t(event.content.rsvp?.heading)}
      before={<Label n={n} text={s.rsvpHeading} />}
    >
      {(f) => {
        const guest = f.guests[0];
        return (
          <>
            {guest && (
              <>
                <label className={st.field}>
                  {s.name}
                  <input
                    className={st.input}
                    value={guest.name}
                    onChange={(e) => f.updateGuest(guest.key, { name: e.target.value })}
                    autoComplete="name"
                  />
                </label>
                {f.error(`guest-${guest.key}-name`) && <span className={st.error}>{s.required}</span>}
                {f.needsMenu && (
                  <>
                    <label className={st.field}>
                      {s.menu}
                      <select className={st.input} value={guest.menu} onChange={(e) => f.updateGuest(guest.key, { menu: e.target.value })}>
                        <option value="" disabled>
                          {s.chooseMenu}
                        </option>
                        {f.menuOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </label>
                    {f.error(`guest-${guest.key}-menu`) && <span className={st.error}>{s.required}</span>}
                  </>
                )}
              </>
            )}
            <RsvpResult f={f} classes={rsvpClasses} />
            <RsvpYesNoButtons f={f} classes={rsvpClasses} />
          </>
        );
      }}
    </RsvpSection>
  );
}

function Location({ n }: { n: number }) {
  const { t, s } = useInvitation();
  const { heading, venues } = useVenues();
  return (
    <section className={st.section}>
      <Label n={n} text={heading || s.location} />
      {venues.map((v) => (
        <div key={v.id} className={st.venue} data-reveal>
          <MapFrame venue={v} classes={{ wrap: st.mapWrap, map: st.map }} />
          <div className={st.venueRow}>
            <span>{[t(v.label), t(v.name), t(v.address)].filter(Boolean).join(", ")}</span>
            <MapsLink venue={v} className={st.directions}>
              {s.directions}
            </MapsLink>
          </div>
        </div>
      ))}
    </section>
  );
}

function Footer() {
  const { t, event } = useInvitation();
  const f = useFooter();
  const dp = dateParts(event.eventDate);
  const one = t(event.content.partnerOne);
  const two = t(event.content.partnerTwo);
  return (
    <footer className={st.footer}>
      <span className={st.footerInitials}>{f.text || (one && two ? `${one[0]} & ${two[0]}` : initials(f.names))}</span>
      <span className={st.footerDate}>
        {dp.d}.{dp.m}.{dp.y}
      </span>
    </footer>
  );
}

/** Modern Minimal Wedding — MinimalWedding.dc.html. */
export default function MinimalWedding() {
  // Numbered sections count up in render order (01 — Покана, 02 — Програма…).
  return (
    <TemplateShell
      classes={{ page: st.page, phone: st.phone }}
      hero={<Hero />}
      sections={{
        welcome: (next) => <Welcome n={next()} />,
        countdown: () => <Countdown />,
        program: (next) => <Program n={next()} />,
        rsvp: (next) => <Rsvp n={next()} />,
        location: (next) => <Location n={next()} />,
        footer: () => <Footer />,
      }}
    />
  );
}
