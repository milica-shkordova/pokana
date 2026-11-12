import type { Locale } from "@pokanito/shared";

/**
 * Fixed guest-facing UI copy. Templates override any key per locale in their
 * definition (`strings`), e.g. Kids says "Доаѓаме!" instead of "Потврди".
 * Editable copy (headings, welcome text…) lives in the event content instead.
 */
export interface UiStrings {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  countdownDone: string;
  rsvpHeading: string;
  /** "{date}" is replaced with the formatted RSVP deadline. */
  rsvpDeadline: string;
  rsvpClosed: string;
  attending: string;
  notAttending: string;
  name: string;
  namePlaceholder: string;
  guestCount: string;
  menu: string;
  chooseMenu: string;
  addGuest: string;
  removeGuest: string;
  children: string;
  adults: string;
  childName: string;
  plusOne: string;
  justMe: string;
  meAndOne: string;
  company: string;
  workEmail: string;
  dinner: string;
  allergies: string;
  allergiesPlaceholder: string;
  message: string;
  submit: string;
  submitDecline: string;
  sending: string;
  thanks: string;
  thanksDecline: string;
  error: string;
  required: string;
  previewNotice: string;
  openInMaps: string;
  directions: string;
  location: string;
  program: string;
  playMusic: string;
  pauseMusic: string;
  language: string;
}

export const baseStrings: Record<Locale, UiStrings> = {
  mk: {
    days: "дена",
    hours: "часа",
    minutes: "мин",
    seconds: "сек",
    countdownDone: "Денот е тука!",
    rsvpHeading: "Потврдете присуство",
    rsvpDeadline: "Ве молиме потврдете до {date}",
    rsvpClosed: "Рокот за потврда помина. За промени, јавете се директно кај домаќините.",
    attending: "Ќе присуствувам",
    notAttending: "Не можам да присуствувам",
    name: "Име и презиме",
    namePlaceholder: "Внеси име и презиме",
    guestCount: "Број на гости",
    menu: "Мени",
    chooseMenu: "Избери мени",
    addGuest: "+ Додај нов гостин",
    removeGuest: "Избриши гостин",
    children: "Деца",
    adults: "Возрасни",
    childName: "Име на детето",
    plusOne: "Плус еден?",
    justMe: "Само јас",
    meAndOne: "Јас + 1",
    company: "Компанија",
    workEmail: "Работен e-mail",
    dinner: "Ќе останам на вечера",
    allergies: "Алергии?",
    allergiesPlaceholder: "пр. без јаткасти плодови",
    message: "Порака",
    submit: "Потврди",
    submitDecline: "Испрати",
    sending: "Се испраќа…",
    thanks: "Благодариме! Потврдата е испратена.",
    thanksDecline: "Благодариме што нè известивте.",
    error: "Нешто тргна наопаку. Ве молиме обидете се повторно.",
    required: "Пополнете го полето за да продолжите",
    previewNotice: "Преглед — потврдите не се испраќаат",
    openInMaps: "Отвори во мапи",
    directions: "Насоки",
    location: "Локација",
    program: "Програма",
    playMusic: "Пушти музика",
    pauseMusic: "Паузирај музика",
    language: "Јазик",
  },
  en: {
    days: "days",
    hours: "hrs",
    minutes: "min",
    seconds: "sec",
    countdownDone: "The day is here!",
    rsvpHeading: "RSVP",
    rsvpDeadline: "Please reply by {date}",
    rsvpClosed: "RSVPs are closed. For changes, please contact the hosts directly.",
    attending: "I'll be there",
    notAttending: "Can't make it",
    name: "Full name",
    namePlaceholder: "Your full name",
    guestCount: "Number of guests",
    menu: "Menu",
    chooseMenu: "Choose a menu",
    addGuest: "+ Add another guest",
    removeGuest: "Remove guest",
    children: "Children",
    adults: "Adults",
    childName: "Child's name",
    plusOne: "Plus one?",
    justMe: "Just me",
    meAndOne: "Me + 1",
    company: "Company",
    workEmail: "Work email",
    dinner: "I'll stay for dinner",
    allergies: "Allergies?",
    allergiesPlaceholder: "e.g. no nuts",
    message: "Message",
    submit: "Confirm",
    submitDecline: "Send",
    sending: "Sending…",
    thanks: "Thank you! Your reply has been sent.",
    thanksDecline: "Thanks for letting us know.",
    error: "Something went wrong. Please try again.",
    required: "Please fill this in to continue",
    previewNotice: "Preview — replies are not sent",
    openInMaps: "Open in maps",
    directions: "Directions",
    location: "Location",
    program: "Program",
    playMusic: "Play music",
    pauseMusic: "Pause music",
    language: "Language",
  },
};
