import type { Locale } from "@pokanito/shared";

/** Fixed copy specific to this design (the countdown is a sentence here). */
export const COPY: Record<Locale, { days: string; hours: string; minutes: string; and: string; joiner: string }> = {
  mk: { days: "дена", hours: "часа", minutes: "минути", and: "и", joiner: "и" },
  en: { days: "days", hours: "hours", minutes: "minutes", and: "and", joiner: "&" },
};
