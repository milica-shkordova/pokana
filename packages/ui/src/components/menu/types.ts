import type { ReactNode } from "react";

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  /** Line icon on the left. */
  icon?: ReactNode;
  /** Small note on the right ("PNG", "for the client"). */
  hint?: string;
  /** Draw a divider above this item (e.g. before the destructive group). */
  divider?: boolean;
}

export interface MenuProps {
  label: string;
  items: MenuItem[];
  trigger?: ReactNode;
  /**
   * BEM block for the menu's classes (`${classPrefix}__button`, `__list`,
   * `__item`, …). The styles still live in the admin
   * (apps/admin/src/styles/components/_menu.scss), hence the default.
   */
  classPrefix?: string;
}
