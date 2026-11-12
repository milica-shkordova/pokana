import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cx, MEDIA } from "@pokanito/ui";
import { INVITE_SAMPLE, fmt, plural, type Copy, type Lang } from "@/content/landing";
import { useLang } from "./i18n";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type InsideCopy = Copy["inside"];

/**
 * "Inside every invitation" (HANDOFF-INSIDE-CARDS): four tinted cards that
 * actually work, so visitors try the countdown, RSVP, directions and language
 * switch the way a guest would. All state is local; nothing is sent anywhere.
 * Desktop: 4 in a row · tablet: 2 × 2 · phone: snap carousel with dots.
 */
export default function Inside() {
  const { t, lang } = useLang();
  const c = t.inside;
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Phone carousel: the dot follows the card closest to the start.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const card = el.firstElementChild as HTMLElement | null;
        if (!card) return;
        setActive(Math.min(3, Math.round(el.scrollLeft / (card.offsetWidth + 12))));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Cards rise in once, with a small stagger.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        gsap.from(".ic-card", {
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: ".ic-cards", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} id="inside" className="ic">
      <div className="ic__inner">
        <div className="ic__head">
          <div className="ic__copy" data-reveal>
            <span className="ui-eyebrow ic__eyebrow">{c.eyebrow}</span>
            <h2 className="ic__title">{c.title}</h2>
            <p className="ic__intro">{c.intro}</p>
          </div>
          <div className="ic__note" aria-hidden>
            <span>{c.note}</span>
            <svg viewBox="0 0 60 70" width="60" height="70" fill="none">
              <path className="ic__note-line" pathLength={100} d="M8 6 C 40 10, 52 34, 40 62" />
              <path className="ic__note-head" pathLength={100} d="M30 54 L 40 64 L 48 52" />
            </svg>
          </div>
        </div>

        <div className="ic-cards" ref={track} role="region" aria-label={c.carouselLabel}>
          <CountdownCard c={c} />
          <RsvpCard c={c} />
          <DirectionsCard c={c} />
          <LanguageCard c={c} pageLang={lang} />
        </div>

        <div className="ic-dots" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cx("ic-dots__dot", active === i && "ic-dots__dot--on")} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CardFoot({ title, text }: { title: string; text: string }) {
  return (
    <div className="ic-card__foot">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

// ── 1 · Live countdown ─────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

function CountdownCard({ c }: { c: InsideCopy }) {
  const { lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  // Computed on the client only (the server render shows placeholders), then
  // ticks every second while the card is on screen.
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(INVITE_SAMPLE.date).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    let id: number | undefined;
    const start = () => {
      if (id === undefined) id = window.setInterval(tick, 1000);
    };
    const stop = () => {
      clearInterval(id);
      id = undefined;
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? (tick(), start()) : stop()));
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  const s = left === null ? null : Math.floor(left / 1000);
  const parts =
    s === null
      ? null
      : { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), min: Math.floor((s % 3600) / 60), sec: s % 60 };
  const tile = (key: keyof InsideCopy["countdown"]["units"], value: string, hot = false) => (
    <span className={cx("ic-count__tile", hot && "ic-count__tile--hot", key === "sec" && "ic-count__tile--sec")}>
      {/* Keyed by value: the digit slides up when it changes. */}
      <b key={value}>{value}</b>
      <span>{c.countdown.units[key]}</span>
    </span>
  );

  return (
    <div className="ic-card ic-card--blush" ref={ref} style={{ "--tilt": "-2deg" } as React.CSSProperties}>
      <div className="ic-card__demo ic-count">
        <span className="ic-script">{c.countdown.until}</span>
        {/* Labelled once; the ticking numbers are not announced. */}
        <div
          className="ic-count__grid"
          role="group"
          aria-label={parts ? fmt(c.countdown.aria, {
                  days: plural(lang, c.countdown.ariaDays, parts.days),
                  hours: plural(lang, c.countdown.ariaHours, parts.hours),
                  minutes: plural(lang, c.countdown.ariaMinutes, parts.min),
                }) : c.countdown.title}
        >
          {tile("days", parts ? String(parts.days) : "–")}
          {tile("hours", parts ? pad(parts.hours) : "–")}
          {tile("min", parts ? pad(parts.min) : "–")}
          {tile("sec", parts ? pad(parts.sec) : "–", true)}
        </div>
      </div>
      <CardFoot title={c.countdown.title} text={c.countdown.text} />
    </div>
  );
}

// ── 2 · RSVP ───────────────────────────────────────────────────────────────
function RsvpCard({ c }: { c: InsideCopy }) {
  const { lang } = useLang();
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [guests, setGuests] = useState(2);
  const r = c.rsvp;
  return (
    <div className="ic-card ic-card--mint" style={{ "--tilt": "1.5deg" } as React.CSSProperties}>
      <div className="ic-card__demo ic-rsvp">
        <button
          type="button"
          className={cx("ic-rsvp__choice", answer === "yes" && "is-on")}
          aria-pressed={answer === "yes"}
          onClick={() => setAnswer("yes")}
        >
          {r.yes}
        </button>
        <div className={cx("ic-rsvp__guests", answer === "yes" && "is-open")} aria-hidden={answer !== "yes"}>
          <span>{r.guests}</span>
          <span className="ic-rsvp__stepper">
            <button
              type="button"
              aria-label={r.fewer}
              tabIndex={answer === "yes" ? 0 : -1}
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
            >
              −
            </button>
            <b>{guests}</b>
            <button
              type="button"
              className="ic-rsvp__plus"
              aria-label={r.more}
              tabIndex={answer === "yes" ? 0 : -1}
              onClick={() => setGuests((g) => Math.min(9, g + 1))}
            >
              +
            </button>
          </span>
        </div>
        <button
          type="button"
          className={cx("ic-rsvp__choice", answer === "no" && "is-on")}
          aria-pressed={answer === "no"}
          onClick={() => setAnswer("no")}
        >
          {r.no}
        </button>
        <p className={cx("ic-rsvp__done", answer && "is-shown")} aria-live="polite">
          {answer === "yes" ? `${r.sentYes} · ${plural(lang, r.guestCount, guests)}` : answer === "no" ? r.sentNo : ""}
        </p>
      </div>
      <CardFoot title={r.title} text={r.text} />
    </div>
  );
}

// ── 3 · Directions ─────────────────────────────────────────────────────────
// Pin spots as % of the map (from the 260 × 210 prototype).
const SPOTS = [
  { left: 15, top: 24 },
  { left: 51, top: 39 },
  { left: 85, top: 67 },
];

function DirectionsCard({ c }: { c: InsideCopy }) {
  const [place, setPlace] = useState(1); // Venue
  const d = c.directions;
  const spot = SPOTS[place];
  return (
    <div className="ic-card ic-card--honey" style={{ "--tilt": "-1.5deg" } as React.CSSProperties}>
      <div className="ic-card__demo ic-map">
        <span className="ic-map__area" aria-hidden>
          <span className="ic-map__road ic-map__road--h" />
          <span className="ic-map__road ic-map__road--v" />
          <span className="ic-map__road ic-map__road--d" />
          <span className="ic-map__pin" style={{ left: `calc(${spot.left}% - 15px)`, top: `calc(${spot.top}% - 15px)` }}>
            <span />
          </span>
        </span>
        <div className="ic-map__places">
          {d.places.map((label, i) => (
            <button key={i} type="button" className={cx(place === i && "is-on")} aria-pressed={place === i} onClick={() => setPlace(i)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <CardFoot title={d.title} text={d.text} />
    </div>
  );
}

// ── 4 · Language ───────────────────────────────────────────────────────────
function LanguageCard({ c, pageLang }: { c: InsideCopy; pageLang: Lang }) {
  // Only switches the sample invitation in this card, not the page.
  const [lang, setLang] = useState<Lang>(pageLang);
  useEffect(() => setLang(pageLang), [pageLang]);
  const sample = INVITE_SAMPLE[lang];
  return (
    <div className="ic-card ic-card--mist" style={{ "--tilt": "2deg" } as React.CSSProperties}>
      <div className="ic-card__demo ic-lang">
        <div className="ic-lang__switch" role="group" aria-label={c.language.switchLabel}>
          {(["mk", "en"] as const).map((l) => (
            <button key={l} type="button" className={cx(lang === l && "is-on")} aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l === "mk" ? "MK" : "EN"}
            </button>
          ))}
        </div>
        {/* Keyed by language: crossfades on change. */}
        <div className="ic-lang__sample" key={lang} lang={lang}>
          <span className="ic-lang__names">{sample.names}</span>
          <span className="ic-lang__text">{sample.text}</span>
        </div>
      </div>
      <CardFoot title={c.language.title} text={c.language.text} />
    </div>
  );
}
