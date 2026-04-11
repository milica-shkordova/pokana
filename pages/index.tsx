import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const WEDDING_DATE = new Date("2026-06-28T17:00:00");

function getTimeLeft() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function WeddingInvitation() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [guests, setGuests] = useState<
    { name: string; menu: string; leaving?: boolean }[]
  >([{ name: "", menu: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (showOverlay) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [showOverlay]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroImgWrapRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying((prev) => !prev);
  };

  const updateGuest = (
    index: number,
    field: "name" | "menu",
    value: string,
  ) => {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  };

  const addGuest = () => {
    setGuests((prev) => [...prev, { name: "", menu: "" }]);
    setAttempted(false);
  };
  const removeGuest = (index: number) => {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, leaving: true } : g)),
    );
    setTimeout(() => {
      setGuests((prev) => prev.filter((g) => !g.leaving));
    }, 280);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (guests.some((g) => !g.name || !g.menu)) return;
    setSubmitting(true);
    const guestLines = guests.map((g) => `${g.name} — ${g.menu}`).join("\n");

    const message = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "  RSVP — Татјана & Драган",
      "  28 јуни 2026 · Ресторан Ксантика",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      guestLines,
      "",
      `  Вкупно гости: ${guests.length}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ].join("\n");

    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: "abae5b86-f1c2-4456-9534-dab1cd266256",
        from_name: "Покана — Татјана & Драган",
        subject: `RSVP: ${guests[0].name} (${guests.length} ${guests.length === 1 ? "гостин" : "гости"})`,
        message,
      }),
    });
    setSubmitting(false);
    setSubmitted(true);
    setGuests([{ name: "", menu: "" }]);
    setAttempted(false);
    setTimeout(() => setSubmitted(false), 5000);
  };

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showOverlay) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // ── Welcome: scale 1.05 → 1 + fade (scrubbed) ───────────
      gsap.set("[data-gsap='welcome']", { opacity: 0, scale: 1.05 });
      gsap.to("[data-gsap='welcome']", {
        opacity: 1,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-gsap='welcome']",
          start: "top 85%",
          end: "top 60%",
          scrub: 1,
        },
      });

      // ── Countdown: stagger items (scrubbed) ──────────────────
      const countdownItems = gsap.utils.toArray<Element>(
        ".inv__countdown-item",
      );
      gsap.set(countdownItems, { opacity: 0, y: 24 });
      const cTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".inv__countdown",
          start: "top 80%",
          end: "top 40%",
          scrub: 1,
        },
      });
      countdownItems.forEach((item, i) => {
        cTl.to(
          item,
          { opacity: 1, y: 0, ease: "none", duration: 0.4 },
          i * 0.25,
        );
      });

      // ── First image: fade in (scrubbed) ──────────────────────
      gsap.set("[data-gsap='img-1']", { opacity: 0 });
      gsap.to("[data-gsap='img-1']", {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-gsap='img-1']",
          start: "top 90%",
          end: "top 55%",
          scrub: 1,
        },
      });

      // ── Program events: cascade (scrubbed) ───────────────────
      const events = gsap.utils.toArray<Element>(".inv__timeline-event");
      gsap.set(events, { opacity: 0, y: 28 });
      const pTl = gsap.timeline({
        scrollTrigger: {
          trigger: "[data-gsap='program']",
          start: "top 70%",
          end: "top 20%",
          scrub: 1,
        },
      });
      events.forEach((ev, i) => {
        pTl.to(ev, { opacity: 1, y: 0, ease: "none", duration: 0.5 }, i * 0.4);
      });
    });

    return () => ctx.revert();
  }, [showOverlay]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const hero = heroRef.current;
    const heroText = heroTextRef.current;
    const imgWrap = heroImgWrapRef.current;
    const scrollHint = scrollHintRef.current;
    if (!hero || !heroText || !imgWrap) return;

    // Push text down so it appears centered initially
    const centerY = (hero.offsetHeight - heroText.offsetHeight) / 2;
    gsap.set(heroText, { y: centerY });
    gsap.set(imgWrap, { clipPath: "circle(0% at 50% 50%)" });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=1000",
          scrub: 1.5,
          pin: true,
        },
      });

      if (scrollHint) tl.to(scrollHint, { opacity: 0, duration: 0.1 }, 0);
      tl.to(heroText, { y: 0, ease: "none", duration: 0.4 }, 0);
      tl.to(
        imgWrap,
        { clipPath: "circle(150% at 50% 50%)", ease: "none", duration: 1 },
        0.3,
      );
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;
    const tryPlay = () => {
      audio.play().catch(() => {});
    };
    tryPlay();
    const startOnInteraction = () => {
      tryPlay();
      document.removeEventListener("touchstart", startOnInteraction);
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("scroll", startOnInteraction);
    };
    document.addEventListener("touchstart", startOnInteraction, { once: true });
    document.addEventListener("click", startOnInteraction, { once: true });
    document.addEventListener("scroll", startOnInteraction, { once: true });

    const handleVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("touchstart", startOnInteraction);
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("scroll", startOnInteraction);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <main className="inv">
      <audio ref={audioRef} src="/music.mp3" loop />

      {/* Overlay */}
      {showOverlay && (
        <div
          className="inv__overlay"
          onClick={() => {
            setShowOverlay(false);
            audioRef.current?.play().catch(() => {});
          }}
        >
          <div className="inv__overlay-circle">
            <h1 className="inv__overlay-h1">Ве покануваме</h1>
            <img
              className="inv__overlay-img"
              src="https://res.cloudinary.com/dox8yqpts/image/upload/v1755779145/Your_paragraph_text_2_mzkvc4.png"
              alt="Покана"
            />
            <span className="inv__overlay-hint">на нашиот посебен ден</span>
            <div className="inv__overlay-btn">Откриј ги деталите</div>
          </div>
        </div>
      )}
      {/* Hero */}
      <section className="inv__hero" ref={heroRef}>
        <div className="inv__hero-text" ref={heroTextRef}>
          <p className="inv__hero-date">28 јуни 2026</p>
          <p className="inv__hero-venue">Ресторан „Ксантика“</p>
          <div className="inv__divider" />
          <div className="inv__names">
            <span>Татјана</span>
            <span className="inv__amp">&amp;</span>
            <span>Драган</span>
          </div>
          <div className="inv__divider" />
        </div>
        <div
          className="inv__hero-image-wrap inv__hero-image-wrap--main"
          ref={heroImgWrapRef}
        >
          <img className="inv__hero-img" src="/slika.jpeg" alt="" />
          <div className="inv__hero-img-overlay" />
          <div className="inv__hero-img-fade" />
        </div>
        <div className="inv__scroll-hint" ref={scrollHintRef}>
          <div className="inv__scroll-hint-mouse" />
          <div className="inv__scroll-hint-chevron" />
          <div className="inv__scroll-hint-chevron" />
        </div>
      </section>

      {/* Welcome */}
      <section className="inv__section" data-gsap="welcome">
        <div className="inv__divider" />
        <p className="inv__label">Драги наши,</p>
        <p className="inv__welcome-text">
          Со огромна радост и среќа ве поканувамe да бидете дел од нашиот
          најсреќен ден.
          <br />
          <br />
          Вашето присуство ќе го направи овој момент уште поспецијален и
          незаборавен за нас.
        </p>
      </section>

      {/* Countdown */}
      <section className="inv__countdown">
        <p className="inv__label">Свадбата започнува за:</p>
        <div className="inv__countdown-grid">
          <div className="inv__countdown-item">
            <span className="inv__countdown-num">{timeLeft.days}</span>
            <span className="inv__countdown-unit">денови</span>
          </div>
          <div className="inv__countdown-item">
            <span className="inv__countdown-num">{timeLeft.hours}</span>
            <span className="inv__countdown-unit">часови</span>
          </div>
          <div className="inv__countdown-item">
            <span className="inv__countdown-num">{timeLeft.minutes}</span>
            <span className="inv__countdown-unit">минути</span>
          </div>
          <div className="inv__countdown-item">
            <span className="inv__countdown-num">{timeLeft.seconds}</span>
            <span className="inv__countdown-unit">секунди</span>
          </div>
        </div>
      </section>
      <div className="inv__hero-image-wrap" data-gsap="img-1">
        <img className="inv__hero-img" src="/slika.jpeg" alt="" />
        <div className="inv__hero-img-overlay" />
        <div className="inv__hero-img-fade" />
      </div>
      {/* Program */}
      <section className="inv__section" data-gsap="program">
        <p className="inv__label">Програма</p>
        <div className="inv__timeline">
          <span className="inv__timeline-event">
            <span>15:15</span> &nbsp;-&nbsp; Црква „Рождество на Пресвета
            Богородица“ &nbsp;
          </span>
          <span className="inv__timeline-event">
            <span>18:30</span> &nbsp;-&nbsp; Матично (ресторан „Ксантика“)
            &nbsp;
          </span>
          <span className="inv__timeline-event">
            <span> 19:00 - 19:30</span> &nbsp;- &nbsp; Прием на гости&nbsp;
            &#x1F942;
          </span>
        </div>
      </section>
      <div className="inv__divider" />

      {/* RSVP */}
      <section className="inv__section" data-gsap="rsvp">
        <p className="inv__label">Потврди присуство</p>
        <p className="inv__sub-text">
          Ве замолуваме да го потврдите вашето присуство најдоцна до 10 јуни
          2026
        </p>
        <form className="inv__form" onSubmit={handleSubmit}>
          {guests.map((guest, i) => (
            <div
              key={i}
              className={`inv__guest-row${guests.length > 1 ? " inv__guest-row--multi" : ""}${guest.leaving ? " inv__guest-row--leaving" : ""}`}
            >
              {guests.length > 1 && (
                <button
                  type="button"
                  className="inv__guest-delete"
                  onClick={() => removeGuest(i)}
                  aria-label="Избриши гостин"
                >
                  ×
                </button>
              )}
              <div className="inv__guest-name-row">
                <input
                  className="inv__input"
                  type="text"
                  placeholder="Внеси име и презиме"
                  value={guest.name}
                  onChange={(e) => updateGuest(i, "name", e.target.value)}
                />
              </div>
              {attempted && !guest.name && (
                <span className="inv__field-error">
                  Пополнете го полето за да продолжите
                </span>
              )}
              <div className="inv__select-wrap">
                <select
                  className={`inv__select${guest.menu === "" ? " inv__select--empty" : ""}`}
                  value={guest.menu}
                  onChange={(e) => updateGuest(i, "menu", e.target.value)}
                >
                  <option value="" disabled>
                    Избери мени
                  </option>
                  <option value="Редовно">Регуларно</option>
                  <option value="Вегетаријанско">Вегетаријанско</option>
                  <option value="Веганско">Веганско</option>
                  <option value="Детско">Детско</option>
                </select>
              </div>
              {attempted && !guest.menu && (
                <span className="inv__field-error">
                  Пополнете го полето за да продолжите
                </span>
              )}
            </div>
          ))}

          <button type="button" className="inv__add-guest" onClick={addGuest}>
            + Додај нов гостин
          </button>

          {submitted && (
            <p className="inv__form-success">
              Благодариме! Потврдата е испратена.
            </p>
          )}

          <button className="inv__button" type="submit" disabled={submitting}>
            {submitting ? "Се испраќа..." : "Потврди"}
          </button>
        </form>
      </section>
      <div className="inv__divider" />
      <div className="inv__hero-image-wrap" data-gsap="img-2">
        <img className="inv__hero-img" src="/slika.jpeg" alt="" />
        <div className="inv__hero-img-overlay" />
        <div className="inv__hero-img-fade" />
      </div>
      {/* Location */}
      <section className="inv__section" data-gsap="location">
        <p className="inv__label">Локација</p>
        <p className="inv__location-name">Ресторан „Ксантика"</p>
        <p className="inv__sub-text location">1640 9, Хиподром, Скопје</p>
        <div className="inv__map-wrap">
          <iframe
            className="inv__map-iframe"
            src="https://maps.google.com/maps?q=Ресторан+Ксантика,+Хиподром,+Скопје&output=embed&z=16"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            className="inv__map-overlay-link"
            href="https://maps.app.goo.gl/xD32BHvULLc4ZTwg7"
            target="_blank"
            rel="noreferrer"
          >
            Отвори на мапа ↗
          </a>
        </div>
      </section>
      <div className="inv__divider" />

      {/* Footer */}
      <button className="inv__music-btn" onClick={toggleMusic}>
        {isPlaying ? "⏸" : "▶"}
      </button>

      <footer className="inv__footer">
        <p className="inv__footer-text">Со нетрпение ве очекуваме</p>
        <p className="inv__footer-names">Татјана &amp; Драган</p>
        <p className="inv__footer-heart">&#9825;</p>
      </footer>
    </main>
  );
}
