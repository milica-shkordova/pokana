import type { ReactNode } from "react";

export interface HeroProps {
  header: ReactNode;
  businessName: string;
  logoUrl?: string | null;
}

export interface EnvelopeProps {
  businessName: string;
  logoUrl?: string | null;
}

/** Which version of the intro runs (useHeroIntro.ts). */
export type Mode = "desktop" | "mobile";
