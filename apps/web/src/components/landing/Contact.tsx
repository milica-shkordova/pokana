import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ApiError, type LeadInput, type TemplateSummary } from "@pokanito/shared";
import {
  Button,
  CONFETTI_COLORS,
  Eyebrow,
  Field,
  Heading,
  HoneypotField,
  Input,
  Lede,
  Select,
  Textarea,
  prefersReducedMotion,
} from "@pokanito/ui";
import { browserApi } from "@/lib/api";
import { fmt } from "@/content/landing";
import { useLang } from "./i18n";

gsap.registerPlugin(useGSAP);

interface Props {
  templates: TemplateSummary[];
  contactEmail: string;
}

const BURST = Array.from({ length: 26 }, (_, i) => ({ color: CONFETTI_COLORS[i % CONFETTI_COLORS.length], strip: i % 3 === 0 }));

/**
 * "Get in touch" (HANDOFF-ANIMATIONS B7). On a successful send the form folds
 * into an envelope and flies off with a confetti burst, then "Message sent!"
 * pops in. On an error the button shakes. Success is always announced in the
 * aria-live region, independent of the animation.
 */
export default function Contact({ templates, contactEmail }: Props) {
  const live = templates.filter((t) => t.status === "live");
  const c = useLang().t.contact;
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [templateId, setTemplateId] = useState(live[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const box = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: box });

  const flyAway = contextSafe(() => {
    const el = box.current!;
    const form = el.querySelector<HTMLElement>(".lp-contact__form")!;
    const env = el.querySelector<HTMLElement>(".lp-send__envelope")!;
    const done = el.querySelector<HTMLElement>(".lp-send__done")!;
    const pieces = gsap.utils.toArray<HTMLElement>(".lp-send__piece", el);

    if (prefersReducedMotion()) {
      gsap.set(form, { autoAlpha: 0 });
      gsap.set(done, { autoAlpha: 1 });
      done.querySelector("button")?.focus();
      return;
    }

    // The envelope starts as the form's box and folds down to 260×170.
    const sx = form.offsetWidth / 260;
    const sy = form.offsetHeight / 170;
    gsap
      .timeline({ onComplete: () => done.querySelector("button")?.focus() })
      // 0–0.5s: fields fade and shrink, the box becomes an envelope.
      .to(form, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: "power2.in" }, 0)
      .fromTo(env, { autoAlpha: 0, scaleX: sx, scaleY: sy }, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: 0.5, ease: "power2.inOut" }, 0)
      .fromTo(".lp-send__flap", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.25)
      .fromTo(".lp-send__seal", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, 0.35)
      // 0.55–1.35s: it flies off to the top right with a confetti burst.
      .to(env, { x: 520, y: -620, rotate: 28, scale: 0.6, duration: 0.8, ease: "power2.in" }, 0.55)
      .set(pieces, { opacity: 1, x: 0, y: 0 }, 0.55)
      .to(
        pieces,
        {
          x: () => gsap.utils.random(-260, 260),
          y: () => gsap.utils.random(-220, 200),
          rotate: () => gsap.utils.random(-400, 400),
          duration: 0.9,
          ease: "expo.out",
        },
        0.55,
      )
      .to(pieces, { opacity: 0, duration: 0.5, stagger: 0.01 }, 1.05)
      .set(env, { autoAlpha: 0 }, 1.4)
      // ~1.5s: "Message sent!" pops in.
      .fromTo(done, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, 1.5);
  });

  const shake = contextSafe(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      ".lp-contact__actions .ui-button",
      { x: 0 },
      { keyframes: { x: [0, -10, 9, -7, 5, -2, 0] }, duration: 0.5, ease: "none" },
    );
  });

  const reset = contextSafe(() => {
    const el = box.current!;
    gsap.set([".lp-send__envelope", ".lp-send__done"], { clearProps: "all" });
    gsap.set(".lp-send__piece", { clearProps: "all" });
    gsap.fromTo(
      ".lp-contact__form",
      { autoAlpha: 0, scale: 0.96 },
      { autoAlpha: 1, scale: 1, duration: prefersReducedMotion() ? 0 : 0.4, ease: "power2.out", clearProps: "all" },
    );
    setStatus("idle");
    el.querySelector<HTMLInputElement>(".lp-contact__form input")?.focus();
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await browserApi.post("/api/public/leads", {
        source: "contact-form",
        name,
        contact,
        templateId: templateId || undefined,
        message: message || undefined,
        website,
      } satisfies LeadInput);
      setStatus("sent");
      setName("");
      setContact("");
      setMessage("");
      flyAway();
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof ApiError && err.status === 429
          ? err.message
          : fmt(c.error, { email: contactEmail }),
      );
      shake();
    }
  };

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
              <button type="button" className="lp-send__again" onClick={reset}>
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
