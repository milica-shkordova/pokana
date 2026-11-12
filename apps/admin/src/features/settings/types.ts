import type { Settings } from "@pokanito/shared";

/** Sets one field of the settings form. */
export type SetSetting = <K extends keyof Settings>(k: K, v: Settings[K]) => void;

/** What every settings section card receives. */
export interface SectionProps {
  form: Settings;
  set: SetSetting;
}

/** A sent invite: its link, and why the email failed (if it did). */
export interface InviteLink {
  url: string;
  emailError: string | null;
}
