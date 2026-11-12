import type { ReactNode } from "react";
import { useInvitation } from "./runtime";
import { useRsvpDeadlineText } from "./hooks";
import { useRsvpForm } from "./useRsvpForm";

// RSVP building blocks around useRsvpForm(). They render the markup most
// templates share; templates pass their classes and keep their own fields.

export type RsvpFormState = ReturnType<typeof useRsvpForm>;

/** Every class an RSVP part may use; each part reads only its own keys. */
export interface RsvpClasses {
  section?: string;
  heading?: string;
  /** Note / deadline line and the "RSVPs are closed" message. */
  note?: string;
  form?: string;
  label?: string;
  input?: string;
  error?: string;
  success?: string;
  /** Wrapper of the yes / no button pair. */
  buttons?: string;
  yes?: string;
  no?: string;
  submit?: string;
  decline?: string;
}

interface RsvpSectionProps {
  /** id of the heading (the section's aria-labelledby). */
  id: string;
  classes: RsvpClasses;
  /** Heading text. Default: the content heading, else the UI "RSVP" string. */
  heading?: string;
  /** Line above the fields. Default: the content note, else the deadline line. */
  note?: string;
  /** Rendered before the heading (e.g. a section number). */
  before?: ReactNode;
  /**
   * "attending": submitting the form means "yes" (designs with a separate
   * decline button). "choice": submits the attending choice made in the form.
   */
  submit?: "attending" | "choice";
  /** The fields, result line and buttons. */
  children: (f: RsvpFormState) => ReactNode;
}

/** `<section>` with heading, the closed message or the `<form>` with its note. */
export function RsvpSection({ id, classes, heading, note, before, submit = "attending", children }: RsvpSectionProps) {
  const { t, s, event } = useInvitation();
  const f = useRsvpForm();
  const deadline = useRsvpDeadlineText();
  const line = note ?? (t(event.content.rsvp?.note) || deadline);
  return (
    <section className={classes.section} aria-labelledby={id}>
      {before}
      <h2 id={id} className={classes.heading}>
        {heading ?? (t(event.content.rsvp?.heading) || s.rsvpHeading)}
      </h2>
      {!f.open ? (
        <p className={classes.note}>{s.rsvpClosed}</p>
      ) : (
        <form
          className={classes.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void (submit === "choice" ? f.submit() : f.submitAs(true));
          }}
        >
          {line && <p className={classes.note}>{line}</p>}
          {children(f)}
        </form>
      )}
    </section>
  );
}

/** Name input with its "please fill this in" error. */
export function RsvpNameField({ f, classes, label }: { f: RsvpFormState; classes: RsvpClasses; label?: string }) {
  const { s } = useInvitation();
  return (
    <>
      <label className={classes.label}>
        {label ?? s.name}
        <input className={classes.input} value={f.fields.name} onChange={(e) => f.set("name", e.target.value)} autoComplete="name" />
      </label>
      {f.error("name") && <span className={classes.error}>{f.error("name")}</span>}
    </>
  );
}

type CountField = "guestCount" | "adults" | "children";

/** Number input for a head count, never below `min`. */
export function RsvpCountField({
  f,
  field,
  label,
  min,
  classes,
}: {
  f: RsvpFormState;
  field: CountField;
  label: string;
  min: number;
  classes: RsvpClasses;
}) {
  return (
    <label className={classes.label}>
      {label}
      <input
        className={classes.input}
        type="number"
        inputMode="numeric"
        min={min}
        value={f.fields[field]}
        onChange={(e) => f.set(field, Math.max(min, Number(e.target.value) || min))}
      />
    </label>
  );
}

/** "Thank you" / error line after submitting. */
export function RsvpResult({ f, classes }: { f: RsvpFormState; classes: RsvpClasses }) {
  if (!f.resultText) return null;
  return (
    <p className={f.failed ? classes.error : classes.success} role="status">
      {f.resultText}
    </p>
  );
}

/** "Confirm" / "Send" pair in a wrapper; the pressed one shows "Sending…". */
export function RsvpYesNoButtons({ f, classes }: { f: RsvpFormState; classes: RsvpClasses }) {
  const { s } = useInvitation();
  return (
    <div className={classes.buttons}>
      <button type="submit" className={classes.yes} disabled={f.sending}>
        {f.sending && f.attending ? s.sending : s.submit}
      </button>
      <button type="button" className={classes.no} disabled={f.sending} onClick={() => void f.submitAs(false)}>
        {f.sending && !f.attending ? s.sending : s.submitDecline}
      </button>
    </div>
  );
}

/** Submit button plus an "I can't attend" button underneath (no wrapper). */
export function RsvpSubmitDecline({ f, classes }: { f: RsvpFormState; classes: RsvpClasses }) {
  const { s } = useInvitation();
  return (
    <>
      <button type="submit" className={classes.submit} disabled={f.sending}>
        {f.sending ? s.sending : s.submit}
      </button>
      <button type="button" className={classes.decline} disabled={f.sending} onClick={() => void f.submitAs(false)}>
        {s.notAttending}
      </button>
    </>
  );
}
