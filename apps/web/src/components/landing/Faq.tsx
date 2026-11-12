import { useId } from "react";
import { Accordion, SectionHeading } from "@pokanito/ui";
import { useLang } from "./i18n";

/** Accordion: one open at a time, first open by default. */
export default function Faq() {
  const { faq: copy } = useLang().t;
  const faq = copy.items;
  const base = useId();
  return (
    <section id="faq" className="ui-section ui-section--white">
      <div className="lp-wrap lp-wrap--narrow ui-stack--32">
        <SectionHeading data-reveal eyebrow={copy.eyebrow} title={copy.title} size="xl" />
        <Accordion
          classPrefix="lp-faq"
          data-reveal-group
          idBase={base}
          itemProps={{ "data-reveal": true }}
          items={faq.map((item) => ({ question: item.q, answer: <p>{item.a}</p> }))}
        />
      </div>
    </section>
  );
}
