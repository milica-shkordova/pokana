export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="landing__hero">
      <div className="landing__hero-bg" />
      <div className="landing__hero-nav landing__container">
        <img className="landing__hero-logo" src="/assets/logo-transparent.png" alt="Invy" />
        <a
          className="landing__hero-navlink"
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("contact");
          }}
        >
          Get in touch
        </a>
      </div>

      <div className="landing__container landing__hero-grid">
        <div data-reveal>
          <p className="landing__eyebrow">Digital invitations, done right</p>
          <h1 className="landing__heading">
            Invitations your guests actually
            <br />
            want to <span className="landing__hero-pop">open</span>.
          </h1>
          <p className="landing__lede">
            Invy designs scroll-animated digital invitations for weddings and
            other special occasions — a beautiful, personal page your guests
            open on their phone, RSVP through, and remember.
          </p>
          <div className="landing__hero-actions">
            <a
              className="landing__button landing__button--primary"
              href="#gallery"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("gallery");
              }}
            >
              Browse templates
            </a>
            <a
              className="landing__button landing__button--ghost"
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("contact");
              }}
            >
              Get in touch
            </a>
          </div>
        </div>

        <div className="landing__hero-collage" data-reveal>
          <span className="landing__hero-doodle landing__hero-doodle--one" aria-hidden>
            ✦
          </span>
          <span className="landing__hero-doodle landing__hero-doodle--two" aria-hidden>
            🎉
          </span>
          <div className="landing__hero-photo landing__hero-photo--one">
            <img src="/assets/1.jpg" alt="" />
          </div>
          <div className="landing__hero-photo landing__hero-photo--two">
            <img src="/assets/2.jpg" alt="" />
          </div>
        </div>
      </div>

      <div className="landing__hero-scroll-hint" aria-hidden>
        <span className="landing__hero-scroll-hint-label">Scroll to explore</span>
        <div className="landing__hero-scroll-hint-mouse" />
        <div className="landing__hero-scroll-hint-chevron" />
        <div className="landing__hero-scroll-hint-chevron" />
      </div>
    </section>
  );
}
