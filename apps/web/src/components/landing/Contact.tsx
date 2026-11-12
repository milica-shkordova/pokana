import { useRef } from "react";
import { Button, Eyebrow, Field, Heading, HoneypotField, Input, Lede, Select, Textarea } from "@pokanito/ui";
import { fmt } from "@/content/landing";
import { useLang } from "./i18n";
import { BURST } from "./contact/constants";
import { useLeadForm } from "./contact/useLeadForm";
import { useContactSendAnimation } from "./contact/useContactSendAnimation";
import type { ContactProps } from "./contact/types";

/**
 * "Get in touch" (HANDOFF-ANIMATIONS B7). On a successful send the form folds
 * into an envelope and flies off with a confetti burst, then "Message sent!"
 * pops in. On an error the button shakes. Success is always announced in the
 * aria-live region, independent of the animation.
 */
export default function Contact({ templates, contactEmail }: ContactProps) {
  const live = templates.filter((t) => t.status === "live");
  const c = useLang().t.contact;

  const box = useRef<HTMLDivElement>(null);
  const { flyAway, shake, reset } = useContactSendAnimation(box);
  const form = useLeadForm("contact-form", {
    initialTemplateId: live[0]?.id ?? "",
    errorMessage: fmt(c.error, { email: contactEmail }),
    onSent: flyAway,
    onError: shake,
  });
  const { name, setName, contact, setContact, templateId, setTemplateId, message, setMessage, website, setWebsite } = form;
  const { status, setStatus, error, submit } = form;

  return (
    <section id="contact" className="ui-section ui-section--white lp-section--contact">
      <div className="lp-wrap">
        <div className="lp-contact ui-inverse" data-reveal>
          <div className="lp-contact__intro">
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <Heading size="lg">{c.title}</Heading>
            <Lede>{c.lede}</Lede>
            <span className="lp-contact__label">{c.emailLabel}</span>
            <a href={`mailto:${contactEmail}`} className="lp-contact__email">
              {contactEmail}
            </a>
          </div>

          <div className="lp-send" ref={box}>
            <form className="lp-contact__form" onSubmit={submit}>
              <Field label={c.name}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.namePlaceholder} autoComplete="name" required />
              </Field>
              <Field label={c.contact}>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={c.contactPlaceholder}
                  required
                  minLength={3}
                />
              </Field>
              <Field label={c.template} full>
                <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                  {live.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                  <option value="">{c.notSure}</option>
                </Select>
              </Field>
              <Field label={c.message} full>
                <Textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={c.messagePlaceholder}
                />
              </Field>
              <HoneypotField value={website} onChange={setWebsite} />
              <div className="lp-contact__actions">
                <Button type="submit" variant="accent" size="lg" loading={status === "sending"} iconRight="→">
                  {status === "sending" ? c.sending : c.send}
                </Button>
                {error && <span className="lp-contact__error">{error}</span>}
              </div>
              {/* Phones: the email moves under the button (see _motion.scss). */}
              <p className="lp-contact__alt">
                {c.orWrite} <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </p>
            </form>

            {/* Decorative: the envelope the form folds into, and its confetti. */}
            <div className="lp-send__envelope" aria-hidden>
              <span className="lp-send__flap" />
              <span className="lp-send__seal" />
            </div>
            <div className="lp-send__burst" aria-hidden>
              {BURST.map((b, i) => (
                <span
                  key={i}
                  className={b.strip ? "lp-send__piece lp-send__piece--strip" : "lp-send__piece"}
                  style={{ background: b.color }}
                />
              ))}
            </div>

            <div className="lp-send__done">
              <span className="lp-send__title">{c.sentTitle}</span>
              <span className="lp-send__text">{c.sentText}</span>
              <button type="button" className="lp-send__again" onClick={() => reset(() => setStatus("idle"))}>
                {c.again}
              </button>
            </div>

            <p className="ui-sr-only" role="status" aria-live="polite">
              {status === "sent" ? `${c.sentTitle} ${c.sentText}` : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
