import { useId, useState } from "react";
import { cx } from "../../cx";
import type { AccordionProps } from "./types";

/** Accordion: one open at a time, the first open by default. */
export function Accordion({ items, classPrefix: c, defaultOpen = 0, idBase, itemProps, ...rest }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const autoId = useId();
  const base = idBase ?? autoId;
  return (
    <div className={c} {...rest}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${base}-q${i}`;
        const panelId = `${base}-a${i}`;
        return (
          <div className={cx(`${c}__item`, isOpen && `${c}__item--open`)} key={i} {...itemProps}>
            <h3 className={`${c}__h`}>
              <button
                id={btnId}
                type="button"
                className={`${c}__q`}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                {item.question}
                <span aria-hidden className={`${c}__sign`}>
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
              className={`${c}__a`}
            >
              <div className={`${c}__a-inner`}>{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
