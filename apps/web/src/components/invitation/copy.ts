import type { Locale } from "@pokanito/shared";

/** Text of the invitation state pages (StatePages.tsx), in the invitation's first language. */
export const COPY = {
  mk: {
    locked: "Оваа покана е заштитена. Внесете го кодот што го добивте заедно со линкот.",
    code: "Код за пристап",
    open: "Отвори ја поканата",
    wrong: "Кодот не е точен. Обидете се повторно.",
    tooMany: "Премногу обиди. Обидете се повторно за неколку минути.",
    ended: "Оваа покана заврши. Ви благодариме што бевте дел од овој посебен ден.",
    unpublished: "Оваа покана сè уште не е објавена. Наскоро ќе биде достапна на овој линк.",
    loading: "Се вчитува…",
    previewError: "Линкот за преглед е неважечки или истечен.",
  },
  en: {
    locked: "This invitation is private. Enter the code you received with the link.",
    code: "Access code",
    open: "Open the invitation",
    wrong: "That code doesn’t match. Please try again.",
    tooMany: "Too many attempts. Please try again in a few minutes.",
    ended: "This invitation has ended. Thank you for being part of a special day.",
    unpublished: "This invitation isn’t published yet. It will be available at this link soon.",
    loading: "Loading…",
    previewError: "This preview link is invalid or has expired.",
  },
};

export type StateCopy = (typeof COPY)["en"];

export const copyFor = (meta: { languages: Locale[] }) => COPY[meta.languages[0] ?? "mk"];
