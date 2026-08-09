import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <section className="landing__section" id="contact">
      <div className="landing__container">
        <div className="landing__contact" data-reveal>
          <div>
            <p className="landing__eyebrow">Get in touch</p>
            <h2 className="landing__heading">
              Let&apos;s make something your guests will love.
            </h2>
            <p className="landing__lede">
              Pick a template, send us your details, and we&apos;ll come back
              with a personalized preview.
            </p>
            <div className="landing__contact-info">
              <div className="landing__contact-info-item">
                <strong>Email</strong>
                <a href="mailto:hello@invy.mk">hello@invy.mk</a>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
