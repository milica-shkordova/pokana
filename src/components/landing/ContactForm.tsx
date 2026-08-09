import { useMemo, useState } from "react";
import { templateRegistry } from "@/templates/registry";
import { getInvyContactWeb3FormsKey, submitWeb3Form } from "@/lib/web3forms";
import ConfettiBurst from "./ConfettiBurst";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [templateOfInterest, setTemplateOfInterest] = useState(
    templateRegistry[0]?.name ?? "",
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const templatesByCategory = useMemo(() => {
    const groups = new Map<string, typeof templateRegistry>();
    for (const t of templateRegistry) {
      groups.set(t.eventType, [...(groups.get(t.eventType) ?? []), t]);
    }
    return groups;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    setSubmitting(true);

    await submitWeb3Form({
      access_key: getInvyContactWeb3FormsKey(),
      from_name: `Invy contact — ${name}`,
      subject: `New lead: ${name} — interested in ${templateOfInterest}`,
      message: [
        `Name: ${name}`,
        `Contact: ${contact}`,
        `Template of interest: ${templateOfInterest}`,
        "",
        message,
      ].join("\n"),
    });

    setSubmitting(false);
    setSubmitted(true);
    setName("");
    setContact("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <form className="landing__form" onSubmit={handleSubmit}>
      <div className="landing__form-field">
        <label htmlFor="contact-name">Name</label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>

      <div className="landing__form-field">
        <label htmlFor="contact-info">Email or phone</label>
        <input
          id="contact-info"
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="How should we reach you?"
          required
        />
      </div>

      <div className="landing__form-field landing__form-field--full">
        <label htmlFor="contact-template">Template of interest</label>
        <select
          id="contact-template"
          value={templateOfInterest}
          onChange={(e) => setTemplateOfInterest(e.target.value)}
        >
          {Array.from(templatesByCategory.entries()).map(
            ([eventType, items]) => (
              <optgroup key={eventType} label={eventType}>
                {items.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            ),
          )}
        </select>
      </div>

      <div className="landing__form-field landing__form-field--full">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your event — date, guest count, anything else"
        />
      </div>

      {submitted && (
        <p className="landing__form-success">
          <ConfettiBurst />
          Thanks! We&apos;ll get back to you shortly. 🎉
        </p>
      )}

      <button
        className="landing__form-submit"
        type="submit"
        disabled={submitting}
      >
        <span>{submitting ? "Sending..." : "Send message"}</span>
        <span className="landing__form-submit-arrow" aria-hidden>
          →
        </span>
      </button>
    </form>
  );
}
