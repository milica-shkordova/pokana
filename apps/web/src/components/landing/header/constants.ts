// Confetti across the bottom of the phone menu.
export const MENU_CONFETTI = [
  { left: "8%", bottom: "14%", w: 34, h: 12, rot: 28, color: "var(--ui-color-rose)" },
  { left: "22%", bottom: "6%", w: 14, h: 14, rot: 0, color: "var(--ui-color-coral)" },
  { left: "34%", bottom: "18%", w: 12, h: 12, rot: 0, color: "var(--ui-color-sage)" },
  { left: "46%", bottom: "8%", w: 30, h: 10, rot: -22, color: "var(--ui-color-marigold)" },
  { left: "60%", bottom: "20%", w: 16, h: 16, rot: 0, color: "var(--ui-color-rose)" },
  { left: "70%", bottom: "5%", w: 34, h: 11, rot: 35, color: "var(--ui-color-sage)" },
  { left: "84%", bottom: "15%", w: 20, h: 20, rot: 0, color: "var(--ui-color-marigold)" },
  { left: "90%", bottom: "4%", w: 12, h: 12, rot: 0, color: "var(--ui-color-terracotta)" },
  { left: "14%", bottom: "28%", w: 10, h: 10, rot: 0, color: "var(--ui-color-marigold)" },
  { left: "78%", bottom: "30%", w: 28, h: 9, rot: -30, color: "var(--ui-color-coral)" },
];

/** Header nav links (label = `t.nav[key]`). */
export const NAV_LINKS = [
  { href: "#templates", key: "templates" },
  { href: "#how", key: "how" },
  { href: "#pricing", key: "pricing" },
] as const;

/** The phone menu also links the FAQ, after the header links. */
export const MENU_EXTRA_LINK = { href: "#faq", key: "faq" } as const;

/** Id of the phone menu (aria-controls of the burger). */
export const MENU_ID = "lp-menu";
/** On <html> while the phone menu is open (hides the scrollbar, CSS). */
export const MENU_OPEN_CLASS = "lp-menu-open";
/** How long the menu takes to roll up (ms) before the scrollbar comes back. */
export const MENU_CLOSE_MS = 420;
