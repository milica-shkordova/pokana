const STEPS = [
  {
    title: "Choose a template",
    text: "Browse the gallery and pick the design that fits your event.",
  },
  {
    title: "Tell us about it",
    text: "Send your details through the contact form — names, date, venue, photos.",
  },
  {
    title: "We personalize it",
    text: "We build your version of the template and send you a preview link.",
  },
  {
    title: "It goes live",
    text: "Your invitation is published at its own link, ready to share.",
  },
];

export default function HowItWorks() {
  return (
    <section className="landing__section">
      <div className="landing__container">
        <div className="landing__section-head" data-reveal>
          <p className="landing__eyebrow">How it works</p>
          <h2 className="landing__heading">Four steps, zero stress</h2>
        </div>

        <div className="landing__steps">
          {STEPS.map((step, i) => (
            <div className="landing__step" data-reveal key={step.title}>
              <span className="landing__step-num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="landing__step-title">{step.title}</h3>
              <p className="landing__step-text">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
