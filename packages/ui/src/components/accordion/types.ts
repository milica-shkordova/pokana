import type { HTMLAttributes, ReactNode } from "react";

export interface AccordionItem {
  /** Button text (inside an <h3>). */
  question: ReactNode;
  /** Panel content (inside `${classPrefix}__a-inner`). */
  answer: ReactNode;
}

/** Extra attributes for each item's wrapper, e.g. { "data-reveal": true }. */
export type AccordionItemAttributes = HTMLAttributes<HTMLDivElement> & { [data: `data-${string}`]: unknown };

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  items: readonly AccordionItem[];
  /**
   * BEM block for every class: the list, `__item`, `__item--open`, `__h`,
   * `__q`, `__sign`, `__a`, `__a-inner`. The accordion has no styles of its
   * own; the landing's FAQ passes "lp-faq".
   */
  classPrefix: string;
  /** Index open at first (-1: all closed). */
  defaultOpen?: number;
  /** Prefix for the button/panel ids (default: useId()). */
  idBase?: string;
  itemProps?: AccordionItemAttributes;
  [data: `data-${string}`]: unknown;
}
