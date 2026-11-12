import { useId, useState } from "react";
import { cx, SectionHeading } from "@pokanito/ui";
import { useLang } from "./i18n";

/** Accordion: one open at a time, first open by default. */
export default function Faq() {
  const [open, setOpen] = useState(0);
  const { faq: copy } = useLang().t;
  const faq = copy.items;
  const base = useId();
  return (
    <section id="faq" className="ui-section ui-section--white">
      <div className="lp-wrap lp-wrap--narrow ui-stack--32">
        <SectionHeading data-reveal eyebrow={copy.eyebrow} title={copy.title} size="xl" />
        <div className="lp-faq" data-reveal-group>
          {faq.map((item, i) => {
            const isOpen = open === i;
            const btnId = `${base}-q${i}`;
            const panelId = `${base}-a${i}`;
            return (
              <div className={cx("lp-faq__item", isOpen && "lp-faq__item--open")} key={i} data-reveal>
                <h3 className="lp-faq__h">
                  <button
                    id={btnId}
                    type="button"
                    className="lp-faq__q"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    {item.q}
                    <span aria-hidden className="lp-faq__sign">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                {/* Always rendered so it can animate; closed answers are hidden
                    from assistive tech. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  aria-hidden={!isOpen}
                  className="lp-faq__a"
                >
                  <div className="lp-faq__a-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
