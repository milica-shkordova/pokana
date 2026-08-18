import { useState } from "react";
import { getClientWeb3FormsKey, submitWeb3Form } from "@/lib/web3forms";

interface Props {
  clientSlug: string;
  eventLabel: string;
  title?: string;
  deadlineText?: string;
  attendingLabel?: string;
  notAttendingLabel?: string;
  showGuestCount?: boolean;
  notesPlaceholder?: string;
  submitLabel?: string;
}

export default function RsvpForm({
  clientSlug,
  eventLabel,
  title = "RSVP",
  deadlineText,
  attendingLabel = "I'll be there",
  notAttendingLabel = "Can't make it",
  showGuestCount = true,
  notesPlaceholder = "Anything else we should know?",
  submitLabel = "Send",
}: Props) {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState(true);
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!name) return;
    setSubmitting(true);

    const message = [
      `RSVP — ${eventLabel}`,
      "",
      `Name: ${name}`,
      attending
        ? `Attending: Yes${showGuestCount ? ` (${guestCount} ${guestCount === 1 ? "guest" : "guests"})` : ""}`
        : "Attending: No",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await submitWeb3Form({
      access_key: getClientWeb3FormsKey(clientSlug),
      from_name: `${eventLabel} — ${name}`,
      subject: attending
        ? `RSVP: ${name}${showGuestCount ? ` (${guestCount})` : ""}`
        : `RSVP: ${name} — Not attending`,
      message,
    });

    setSubmitting(false);
    setSubmitted(true);
    setName("");
    setGuestCount(1);
    setNotes("");
    setAttempted(false);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="tpl-section" data-reveal>
      <p className="tpl-label">{title}</p>
      {deadlineText && <p className="tpl-sub-text">{deadlineText}</p>}
      <form className="tpl-form" onSubmit={handleSubmit}>
        <div className="tpl-attendance">
          <label
            className={`tpl-attendance-option${attending ? " tpl-attendance-option--active" : ""}`}
          >
            <input
              type="radio"
              name="attendance"
              checked={attending}
              onChange={() => setAttending(true)}
            />
            {attendingLabel}
          </label>
          <label
            className={`tpl-attendance-option${!attending ? " tpl-attendance-option--active" : ""}`}
          >
            <input
              type="radio"
              name="attendance"
              checked={!attending}
              onChange={() => setAttending(false)}
            />
            {notAttendingLabel}
          </label>
        </div>

        <div className="tpl-field-row">
          <input
            className="tpl-input"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {attempted && !name && (
            <span className="tpl-field-error">Please enter your name</span>
          )}
        </div>

        {attending && showGuestCount && (
          <div className="tpl-field-row">
            <label className="tpl-field-label">Number of guests</label>
            <input
              className="tpl-input tpl-input--number"
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
            />
          </div>
        )}

        <div className="tpl-field-row">
          <textarea
            className="tpl-textarea"
            placeholder={notesPlaceholder}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {submitted && (
          <p className="tpl-form-success">Thank you! Your response has been sent.</p>
        )}

        <button className="tpl-button" type="submit" disabled={submitting}>
          {submitting ? "Sending..." : submitLabel}
        </button>
      </form>
    </section>
  );
}
