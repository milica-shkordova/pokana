import type { CSSProperties } from "react";
import { colors } from "@pokanito/ui/tokens";

// Inline styles of the link-preview image (pages/api/og/[slug]). The OG
// renderer only understands inline styles. Edge runtime: keep imports edge-safe.

export const ogStyles = {
  card: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: colors.cream,
    color: colors.ink,
    fontFamily: "Sans",
    padding: 80,
    position: "relative",
  },
  subtitle: {
    fontSize: 26,
    letterSpacing: 6,
    color: colors.muted,
    display: "flex",
  },
  ruleTop: {
    width: 240,
    height: 2,
    background: colors.borderDashed,
    marginTop: 28,
    display: "flex",
  },
  rule: {
    width: 240,
    height: 2,
    background: colors.borderDashed,
    display: "flex",
  },
  logo: { position: "absolute", bottom: 52 },
} satisfies Record<string, CSSProperties>;

/** The names / headline; `fontSize` depends on the event and title length. */
export const ogTitleStyle = (fontSize: number): CSSProperties => ({
  fontFamily: "Serif",
  fontStyle: "italic",
  fontSize,
  lineHeight: 1.05,
  textAlign: "center",
  marginTop: 24,
  marginBottom: 24,
  maxWidth: 1000,
  display: "flex",
});
