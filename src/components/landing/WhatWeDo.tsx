const FEATURES = [
  {
    icon: "✦",
    title: "Handpicked templates",
    text: "Every template is built for one kind of event, with the fun details — countdowns, timelines, maps — that occasion actually deserves.",
  },
  {
    icon: "✎",
    title: "Personalized for you",
    text: "Send us your details — names, date, venue, photos — and we'll turn them into your own version of the template. No design skills required.",
  },
  {
    icon: "↗",
    title: "One link to share",
    text: "Your invitation lives at its own page. Drop it in the group chat — no app to install, no account for your guests to create.",
  },
];

export default function WhatWeDo() {
  return (
    <section className="landing__section">
      <div className="landing__container">
        <div className="landing__section-head" data-reveal>
          <p className="landing__eyebrow">What we do</p>
          <h2 className="landing__heading">An invitation people actually get excited about</h2>
          <p className="landing__lede">
            We design and personalize the page, host it, and hand you a link
            — you focus on throwing the party.
          </p>
        </div>

        <div className="landing__features">
          {FEATURES.map((f) => (
            <div className="landing__feature" data-reveal key={f.title}>
              <div className="landing__feature-icon">{f.icon}</div>
              <h3 className="landing__feature-title">{f.title}</h3>
              <p className="landing__feature-text">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
