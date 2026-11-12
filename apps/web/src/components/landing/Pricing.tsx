import { buttonClassName, cx, SectionHeading } from "@pokanito/ui";
import { planMeta } from "@/content/landing";
import { Icon } from "./Icon";
import { useLang } from "./i18n";

/** Pricing heading block. */
export function PricingIntro(props: { "data-reveal"?: boolean }) {
  const p = useLang().t.pricing;
  return (
    <div className="lp-stack-10 lp-center" {...props}>
      <SectionHeading eyebrow={p.eyebrow} title={p.title} size="xl" lede={p.lede} />
      <span className="lp-pricing__badge">
        <Icon name="mail" size={16} />
        {p.badge}
      </span>
    </div>
  );
}

/** Two plans with a calm fade-up (HANDOFF-ANIMATIONS B6, via data-reveal). */
export default function Pricing() {
  const pricing = useLang().t.pricing;
  const plans = planMeta.map((m, i) => ({ ...m, ...pricing.plans[i] }));
  return (
    <section id="pricing" className="lp-section lp-section--cream lp-section--tall">
      <div className="lp-wrap lp-stack-40">
        <PricingIntro data-reveal />
        <div className="lp-plans" data-reveal-group>
          {plans.map((p, i) => (
            <div key={i} className={cx("lp-plan", p.featured && "lp-plan--featured")} data-reveal>
              {p.ribbon && (
                <span className="lp-plan__ribbon" data-reveal-after>
                  {p.ribbon}
                </span>
              )}
              <div className="lp-plan__head">
                <span className="lp-plan__name">{p.name}</span>
                <span className="lp-plan__price">
                  {p.price} <span>{pricing.currency}</span>
                </span>
              </div>
              <ul className="lp-plan__features">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a
                href="#contact"
                className={buttonClassName({ variant: p.featured ? "primary" : "outline", size: "lg", block: true }, "lp-plan__cta")}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
