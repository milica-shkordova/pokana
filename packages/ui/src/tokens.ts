// KEEP IN SYNC with styles/_tokens.scss (colours, fonts) and
// styles/tools/_breakpoints.scss (breakpoints, media features). This file is
// the TypeScript copy of the design tokens, for code that cannot read CSS
// custom properties: canvas / gsap / QR / OG images, matchMedia queries and
// inline styles rendered before the stylesheet applies.

/** Brand palette: the raw hex values of --ui-color-* in _tokens.scss. */
export const colors = {
  // Accents
  terracotta: "#b5502f",
  coral: "#d9693f",
  rose: "#ee9c92",
  roseHover: "#f4b3aa",
  marigold: "#e9a94f",
  sage: "#9db59a",
  clayDeep: "#8e3a22",

  // Tints
  blushTint: "#fbe6e0",
  blushTintHover: "#f8dcd3",
  honey: "#fcefd9",
  peach: "#fbe9d4",
  peachHover: "#f8dfc2",
  mint: "#e6eee4",
  mist: "#e4eaf2",
  lilac: "#f6e1ec",
  line: "#f0e2d6",
  warningTint: "#fdecd6",
  dangerTint: "#fbe0da",

  // Neutrals
  white: "#fff",
  cream: "#fff9f3",
  paper: "#fffdf9",
  rowHover: "#fffcf8",
  avatarPending: "#c9b79c",
  mediaDark: "#4a4645",
  bezel: "#1e1b1a",
  envelopeFlap: "#f3d7be",
  photoPlaceholder: "#b49a8a",

  // Dark contact card
  cocoa: "#3a2a26",
  cocoaInput: "#4a3833",
  cocoaLine: "#6b5650",
  cocoaText: "#fbefe8",
  cocoaSoft: "#d9c8bf",
  cocoaFaint: "#bfa99e",
  cocoaPlaceholder: "#a8928a",
  cocoaAccent: "#f2b49f",

  // Ink
  ink: "#2a2522",
  inkSoft: "#4a403a",
  textSecondary: "#5e544c",
  muted: "#7a6e66",
  faint: "#a39b8f",

  // Lines and roles with their own value
  borderSoft: "#f5ebe2",
  borderDashed: "#e7c9b8",
  danger: "#8c3b2e",
  warning: "#8a5a12",
  success: "#3d5a41",
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Confetti (contact form burst, footer rain, ConfettiBurst): coral, marigold,
 * rose, sage, terracotta. Upper-case hex, as the landing has always rendered
 * them in its server HTML.
 */
export const CONFETTI_COLORS: string[] = [colors.coral, colors.marigold, colors.rose, colors.sage, colors.terracotta].map((c) =>
  c.toUpperCase(),
);

/** The same confetti palette as CSS variables (hero specks and burst). */
export const CONFETTI_VARS: string[] = [
  "var(--ui-color-coral)",
  "var(--ui-color-marigold)",
  "var(--ui-color-rose)",
  "var(--ui-color-sage)",
  "var(--ui-color-terracotta)",
];

/** Placeholder thumbnail tones for events without a photo (admin, Main.dc.html). */
export const THUMB_TONES = ["#C9B79C", "#E5B9A8", "#9FB3A3", "#B7C2D6", "#D8C6E0", "#CDBB8A"];

/** Font stacks: --ui-font-* in _tokens.scss. */
export const fonts = {
  heading: '"Fredoka", "M PLUS Rounded 1c", "Nunito", "Manrope", system-ui, sans-serif',
  body: '"Manrope", system-ui, sans-serif',
  script: '"Caveat", "Comic Sans MS", cursive',
  serif: '"Cormorant Garamond", Georgia, serif',
  mono: 'ui-monospace, "Cascadia Code", Consolas, monospace',
} as const;

// Brand fonts. Fredoka + Manrope are the brand fonts; Cormorant Garamond is
// kept for the template thumbnails and previews that use it.
export const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&family=Caveat:wght@600;700&family=M+PLUS+Rounded+1c:wght@700;800&family=Nunito:wght@600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Manrope:wght@300;400;500;600;700;800&display=swap";

/** $breakpoints in tools/_breakpoints.scss (px). */
export const BREAKPOINTS = {
  "phone-sm": 520,
  phone: 600,
  phablet: 640,
  mobile: 720,
  "tablet-sm": 760,
  tablet: 768,
  "tablet-lg": 900,
  desktop: 1024,
  "desktop-md": 1100,
  container: 1128,
  "desktop-lg": 1180,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** Same strings as up-query / down-query / below-query in _breakpoints.scss. */
export const upQuery = (name: Breakpoint) => `(min-width: ${BREAKPOINTS[name]}px)`;
export const downQuery = (name: Breakpoint) => `(max-width: ${BREAKPOINTS[name]}px)`;
export const belowQuery = (name: Breakpoint) => `(max-width: ${BREAKPOINTS[name] - 1}px)`;

// Media features: $reduced-motion, $motion-ok, $fine-pointer, $coarse-pointer.
const reducedMotion = "(prefers-reduced-motion: reduce)";
const motionOk = "(prefers-reduced-motion: no-preference)";
const finePointer = "(hover: hover) and (pointer: fine)";
const coarsePointer = "(pointer: coarse)";

/** Media queries for matchMedia / gsap.matchMedia, built like the Sass mixins. */
export const MEDIA = {
  reducedMotion,
  motionOk,
  finePointer,
  coarsePointer,
  /** up(desktop, $and: motion-ok): the landing's desktop choreography. */
  desktopMotion: `${upQuery("desktop")} and ${motionOk}`,
  /** below(desktop, $and: motion-ok): the landing's mobile choreography. */
  mobileMotion: `${belowQuery("desktop")} and ${motionOk}`,
  /** Desktop, hover-capable fine pointer, motion allowed (hero magnetic CTAs, parallax). */
  desktopFinePointerMotion: `${upQuery("desktop")} and ${finePointer} and ${motionOk}`,
  /**
   * Any fine pointer (no hover requirement), motion allowed: the custom cursor.
   * TS only: Sass has no plain "(pointer: fine)" feature.
   */
  pointerFineMotion: `(pointer: fine) and ${motionOk}`,
} as const;
