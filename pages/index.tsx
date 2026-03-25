import { useEffect, useRef, useState } from "react";

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
  const [guests, setGuests] = useState([{ name: "", menu: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

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
  const removeGuest = (index: number) =>
    setGuests((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (guests.some((g) => !g.name || !g.menu)) return;
    setSubmitting(true);
    const message = guests
      .map((g, i) => `Гостин ${i + 1}: ${g.name} — ${g.menu}`)
      .join("\n");
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: "abae5b86-f1c2-4456-9534-dab1cd266256",
        subject: `RSVP: ${guests[0].name}`,
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
    const observe = (sel: string, cls: string, once = true) => {
      const els = document.querySelectorAll(sel);
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(cls);
              if (once) obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 },
      );
      els.forEach((el) => obs.observe(el));
      return obs;
    };

    const o1 = observe("[data-reveal]", "inv--visible");
    const o2 = observe("[data-slide='left']", "inv--slide-visible");
    const o3 = observe("[data-slide='right']", "inv--slide-visible");

    const timelineItems = document.querySelectorAll(".inv__timeline-event");
    const o4 = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          timelineItems.forEach((el) =>
            el.classList.add("inv--timeline-visible"),
          );
          o4.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (timelineItems.length) o4.observe(timelineItems[0]);

    return () => {
      o1.disconnect();
      o2.disconnect();
      o3.disconnect();
      o4.disconnect();
    };
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
      <section className="inv__hero">
        <div className="inv__hero-text">
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
        <div className="inv__hero-image-wrap">
          <img className="inv__hero-img" src="/slika.jpeg" alt="" />
          <div className="inv__hero-img-overlay" />
          <div className="inv__hero-img-fade" />
        </div>
      </section>

      {/* Welcome */}
      <section className="inv__section" data-reveal>
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
      <section className="inv__countdown" data-reveal>
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
      <div className="inv__hero-image-wrap" data-slide="left">
        <img className="inv__hero-img" src="/slika.jpeg" alt="" />
        <div className="inv__hero-img-overlay" />
        <div className="inv__hero-img-fade" />
      </div>
      {/* Program */}
      <section className="inv__section" data-reveal>
        <p className="inv__label">Програма</p>
        <div className="inv__timeline">
          <span className="inv__timeline-event">
            <span>15:00</span> &nbsp;-&nbsp; Црква Св.ХХXXХ &nbsp;
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
      <section className="inv__section" data-reveal>
        <p className="inv__label">Потврди присуство</p>
        <p className="inv__sub-text">
          Ве замолуваме да го потврдите вашето присуство најдоцна до 10 јуни
          2026
        </p>
        <form className="inv__form" onSubmit={handleSubmit}>
          {guests.map((guest, i) => (
            <div
              key={i}
              className={`inv__guest-row${guests.length > 1 ? " inv__guest-row--multi" : ""}`}
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
      <div className="inv__hero-image-wrap" data-slide="right">
        <img className="inv__hero-img" src="/slika.jpeg" alt="" />
        <div className="inv__hero-img-overlay" />
        <div className="inv__hero-img-fade" />
      </div>
      {/* Location */}
      <section className="inv__section" data-reveal>
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
      <footer className="inv__footer" data-reveal>
        <p className="inv__footer-text">Со нетрпение ве очекуваме</p>
        <p className="inv__footer-names">Татјана &amp; Драган</p>
        <p className="inv__footer-heart">&#9825;</p>
      </footer>
    </main>
  );
}
