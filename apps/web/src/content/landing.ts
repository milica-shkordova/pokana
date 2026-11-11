// Landing page copy (Landing.dc.html) in English and Macedonian. Kept in one
// place so the owner can edit wording and fill in numbers without touching
// components. Components read it through `useLang()` (components/landing/i18n).
//
// TODO(owner): replace every `[PRICE]` and `[N]` below with real values
// (HANDOFF §12 open question 2). They are intentionally shown as-is until then.
// Template names and descriptions come from the admin (Templates screen) and
// are not translated here.

import type { TemplateCategory } from "@momentelo/shared";

export type Lang = "en" | "mk";
export const LANGS: Lang[] = ["en", "mk"];

// ── Shared, non-text data ───────────────────────────────────────────────────
export const featureMeta = [
  { icon: "grid", tone: { bg: "#FBE6E0", fg: "#B5502F" } },
  { icon: "pen", tone: { bg: "#FCEFD9", fg: "#9A6418" } },
  { icon: "link", tone: { bg: "#E6EEE4", fg: "#4F6B53" } },
] as const;

/** Sample invitation shown in the "Inside every invitation" try-it cards. */
export const INVITE_SAMPLE = {
  /** The countdown ticks down to this moment (local time). */
  date: "2027-09-18T16:00:00",
  en: { names: "Ana & Marko", text: "Dear friends, we would love you to celebrate with us." },
  mk: { names: "Ана и Марко", text: "Драги пријатели, ве покануваме да славиме заедно." },
};

export const stepMeta = [
  { color: "#D9693F", ink: "#2A2522" },
  { color: "#E9A94F", ink: "#2A2522" },
  { color: "#EE9C92", ink: "#2A2522" },
  { color: "#9DB59A", ink: "#2A2522" },
] as const;

export const planMeta = [
  { price: "[PRICE]", featured: false },
  { price: "[PRICE]", featured: true },
] as const;

// ── Copy ───────────────────────────────────────────────────────────────────
const en = {
  meta: {
    title: (name: string) => `${name} — Digital invitations that feel like an event`,
  },
  lang: { label: "Language", en: "EN", mk: "МК" },
  nav: {
    label: "Main",
    home: (name: string) => `${name} — home`,
    templates: "Templates",
    how: "How it works",
    pricing: "Pricing",
    faq: "FAQ",
    contact: "Get in touch",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    eyebrow: "Digital invitations, done right",
    titleStart: "Invitations your guests actually want to ",
    titlePop: "open",
    lede: "Momentelo designs scroll-animated digital invitations for weddings, birthdays, christenings and company events — a beautiful, personal page your guests open on their phone, RSVP through, and remember.",
    browse: "Browse templates",
    contact: "Get in touch",
    stickerRsvp: "I’ll be there ✓",
    stickerDays: "313 days to go",
    scroll: "there’s more",
    // Envelope intro (HANDOFF-ANIMATIONS B1).
    intro: {
      kicker: "YOU’RE INVITED BY",
      tagline: "to moments worth remembering",
      hint: "Open me!",
      sealLabel: "Open the invitation",
      title: "You’ve got an invitation.",
      button: "Break the seal",
    },
  },
  what: {
    eyebrow: "What we do",
    titleA: "An invitation people actually",
    titleB: "get excited about",
    lede: "We design and personalize the page, host it, and hand you a link — you focus on throwing the party.",
    features: [
      {
        title: "Handpicked templates",
        text: "Every template is built for one kind of event, with the fun details — countdowns, timelines, maps — that occasion actually deserves.",
      },
      {
        title: "Personalized for you",
        text: "Send us your details — names, date, venue, photos — and we'll turn them into your own version of the template. No design skills required.",
      },
      {
        title: "One link to share",
        text: "Your invitation lives at its own page. Drop it in the group chat — no app to install, no account for your guests to create.",
      },
    ],
  },
  how: {
    eyebrow: "How it works",
    title: "Four steps, zero stress",
    steps: [
      { title: "Choose a template", text: "Browse the gallery and pick the design that fits your event." },
      { title: "Tell us about it", text: "Send your details through the contact form — names, date, venue, photos." },
      { title: "We personalize it", text: "We build your version of the template and send you a preview link." },
      { title: "It goes live", text: "Your invitation is published at its own link, ready to share." },
    ],
    notifTitle: "You’re invited!",
    notifText: "Ana & Marko · 18.09.2027",
    tag: "Ana & Marko",
  },
  templates: {
    eyebrow: "Templates",
    title: "Pick your vibe",
    lede: "Every template is a real, working invitation. Tap one to open the live demo on your phone.",
    tabsLabel: "Event type",
    all: "All",
    categories: {
      wedding: { one: "Wedding", many: "Weddings" },
      birthday: { one: "Birthday", many: "Birthdays" },
      corporate: { one: "Corporate", many: "Corporate" },
      christening: { one: "Christening", many: "Christenings" },
    } as Record<TemplateCategory, { one: string; many: string }>,
    openDemo: "Open demo ↗",
    openDemoAria: (name: string) => `${name}: open live demo`,
    frameTitle: (name: string) => `${name} demo`,
    viewDemo: "View live demo ↗",
    swipe: "swipe for more",
    comingSoon: "Coming soon:",
    notifyMe: "Notify me →",
    empty: (category: string | null, hasSoon: boolean) =>
      `No live ${category ? category.toLowerCase() + " " : ""}templates yet${hasSoon ? " — the ones below are on their way." : "."}`,
  },
  notify: {
    title: "Notify me when it’s ready",
    sentBefore: "Thanks! We’ll let you know as soon as ",
    sentAfter: " is ready.",
    sentFallback: "the template",
    done: "Done",
    intro: "Leave your name and how to reach you — we’ll write once it’s live.",
    name: "Name",
    contact: "Email or phone",
    template: "Template",
    cancel: "Cancel",
    submit: "Notify me",
    error: "Something went wrong — please try again.",
  },
  inside: {
    eyebrow: "Inside every invitation",
    title: "Try it like your guests will",
    intro: "Everything they need is inside the link. Nothing to install, nothing to print.",
    note: "Go on, they work!",
    carouselLabel: "Invitation features",
    countdown: {
      title: "Live countdown",
      text: "Ticks down every time they reopen the link.",
      until: "until the big day",
      units: { days: "days", hours: "hours", min: "min", sec: "sec" },
      aria: (d: number, h: number, m: number) =>
        `${d} ${d === 1 ? "day" : "days"}, ${h} ${h === 1 ? "hour" : "hours"}, ${m} ${m === 1 ? "minute" : "minutes"} until the wedding`,
    },
    rsvp: {
      title: "RSVP in a tap",
      text: "Guest count and menu choice, straight to your email.",
      yes: "Yes, we’ll be there",
      no: "Sorry, can’t make it",
      guests: "Guests",
      fewer: "Fewer guests",
      more: "More guests",
      sentYes: "✓ Sent to Ana & Marko’s inbox",
      sentNo: "✓ Ana & Marko will get your note",
      guestCount: (n: number) => `${n} ${n === 1 ? "guest" : "guests"}`,
    },
    directions: {
      title: "One-tap directions",
      text: "Church, venue and parking, right in their maps app.",
      places: ["Church", "Venue", "Parking"],
    },
    language: {
      title: "Macedonian or English",
      text: "Or both, with a switch for guests abroad.",
      switchLabel: "Invitation language",
    },
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Simple, one-time pricing",
    lede: "No subscriptions. Pay once per event.",
    currency: "MKD",
    badge: "Every plan: each RSVP goes straight to your email",
    plans: [
      {
        name: "Essential",
        ribbon: "",
        features: ["Any live template", "Your names, date, program, map", "Up to [N] photos"],
        cta: "Choose Essential",
      },
      {
        name: "Signature",
        ribbon: "Most chosen",
        features: ["Everything in Essential", "Background music & photo gallery", "Two languages"],
        cta: "Choose Signature",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions you might have",
    items: [
      {
        q: "How long does it take?",
        a: "Usually [N] working days from when we receive your details and photos. Small changes after that are quick.",
      },
      {
        q: "Do my guests need an app or an account?",
        a: "No. They open a link in WhatsApp, Viber or SMS and everything works in the phone browser.",
      },
      {
        q: "Can we change details after it’s published?",
        a: "Yes. The link stays the same, so guests always see the latest program, time or venue.",
      },
      {
        q: "How do we see who is coming?",
        a: "Every RSVP is sent straight to your email, with names, number of guests and menu choices.",
      },
      {
        q: "How long does the invitation stay online?",
        a: "[N] months after the event, so guests can come back to the photos and memories.",
      },
    ],
  },
  contact: {
    eyebrow: "Get in touch",
    title: "Let's make something your guests will love.",
    lede: "Pick a template, send us your details, and we'll come back with a personalized preview.",
    emailLabel: "EMAIL",
    name: "Name",
    namePlaceholder: "Your name",
    contact: "Email or phone",
    contactPlaceholder: "How should we reach you?",
    template: "Template of interest",
    notSure: "Not sure yet",
    message: "Message",
    messagePlaceholder: "Tell us about your event — date, guest count, anything else",
    send: "Send message",
    sending: "Sending…",
    sentTitle: "Message sent!",
    sentText: "We'll come back to you with a preview.",
    again: "Send another",
    error: (email: string) => `Something went wrong — please try again, or email us at ${email}.`,
    orWrite: "or write to",
  },
  footer: {
    tagline: "Digital invitations for moments worth remembering.",
    rights: (year: number, name: string) => `© ${year} ${name}`,
  },
  cursor: { open: "Open" },
};

export type Copy = typeof en;

const mk: Copy = {
  meta: {
    title: (name) => `${name} — Дигитални покани што се чувствуваат како настан`,
  },
  lang: { label: "Јазик", en: "EN", mk: "МК" },
  nav: {
    label: "Главна навигација",
    home: (name) => `${name} — почетна`,
    templates: "Шаблони",
    how: "Како функционира",
    pricing: "Цени",
    faq: "Прашања",
    contact: "Јавете ни се",
    openMenu: "Отвори мени",
    closeMenu: "Затвори мени",
  },
  hero: {
    eyebrow: "Дигитални покани, направени како што треба",
    titleStart: "Покани што гостите навистина сакаат да ги ",
    titlePop: "отворат",
    lede: "Momentelo изработува анимирани дигитални покани за свадби, родендени, крштевања и корпоративни настани — убава, лична страница што гостите ја отвораат на телефон, преку неа потврдуваат присуство и ја паметат.",
    browse: "Види шаблони",
    contact: "Јавете ни се",
    stickerRsvp: "Ќе присуствувам ✓",
    stickerDays: "Уште 313 дена",
    scroll: "има уште",
    intro: {
      kicker: "ВЕ ПОКАНУВА",
      tagline: "на моменти што вредат да се паметат",
      hint: "Отвори ме!",
      sealLabel: "Отвори ја поканата",
      title: "Добивте покана.",
      button: "Скрши го печатот",
    },
  },
  what: {
    eyebrow: "Што правиме",
    titleA: "Покана на која гостите",
    titleB: "навистина ќе се израдуваат",
    lede: "Ние ја дизајнираме и персонализираме страницата, ја хостираме и ви даваме линк — вие фокусирајте се на славењето.",
    features: [
      {
        title: "Избрани шаблони",
        text: "Секој шаблон е направен за одреден вид настан, со забавните детали — одбројување, програма, мапи — што тој настан ги заслужува.",
      },
      {
        title: "Персонализирано за вас",
        text: "Испратете ни ги деталите — имиња, датум, место, фотографии — и ние ќе ги претвориме во ваша верзија на шаблонот. Не ви треба знаење за дизајн.",
      },
      {
        title: "Еден линк за споделување",
        text: "Вашата покана има своја страница. Споделете ја во групниот разговор — без апликација и без профил за гостите.",
      },
    ],
  },
  how: {
    eyebrow: "Како функционира",
    title: "Четири чекори, без стрес",
    steps: [
      { title: "Изберете шаблон", text: "Разгледајте ја галеријата и изберете дизајн што одговара на вашиот настан." },
      { title: "Кажете ни повеќе", text: "Испратете ни ги деталите преку контакт формата — имиња, датум, место, фотографии." },
      { title: "Ние ја персонализираме", text: "Ја изработуваме вашата верзија на шаблонот и ви праќаме линк за преглед." },
      { title: "Поканата е онлајн", text: "Вашата покана се објавува на сопствен линк, подготвена за споделување." },
    ],
    notifTitle: "Поканети сте!",
    notifText: "Ана и Марко · 18.09.2027",
    tag: "Ана и Марко",
  },
  templates: {
    eyebrow: "Шаблони",
    title: "Изберете го вашиот стил",
    lede: "Секој шаблон е вистинска покана што работи. Допрете еден за да го отворите демото на телефон.",
    tabsLabel: "Вид на настан",
    all: "Сите",
    categories: {
      wedding: { one: "Свадба", many: "Свадби" },
      birthday: { one: "Роденден", many: "Родендени" },
      corporate: { one: "Корпоративно", many: "Корпоративни" },
      christening: { one: "Крштевање", many: "Крштевања" },
    },
    openDemo: "Отвори демо ↗",
    openDemoAria: (name) => `${name}: отвори демо`,
    frameTitle: (name) => `${name} демо`,
    viewDemo: "Види демо ↗",
    swipe: "лизгај за повеќе",
    comingSoon: "Наскоро:",
    notifyMe: "Известете ме →",
    empty: (category, hasSoon) =>
      `${category ? `Сè уште нема активни шаблони во категоријата „${category}“` : "Сè уште нема активни шаблони"}${
        hasSoon ? " — оние подолу доаѓаат наскоро." : "."
      }`,
  },
  notify: {
    title: "Известете ме кога ќе биде подготвен",
    sentBefore: "Ви благодариме! Ќе ве известиме штом ",
    sentAfter: " ќе биде подготвен.",
    sentFallback: "шаблонот",
    done: "Готово",
    intro: "Оставете име и начин за контакт — ќе ви пишеме штом биде достапен.",
    name: "Име",
    contact: "Е-пошта или телефон",
    template: "Шаблон",
    cancel: "Откажи",
    submit: "Известете ме",
    error: "Нешто тргна наопаку — обидете се повторно.",
  },
  inside: {
    eyebrow: "Во секоја покана",
    title: "Пробајте како вашите гости",
    intro: "Сè што им треба е во линкот. Ништо за инсталирање, ништо за печатење.",
    note: "Пробајте, работат!",
    carouselLabel: "Можности на поканата",
    countdown: {
      title: "Одбројување во живо",
      text: "Се одбројува секогаш кога ќе го отворат линкот.",
      until: "до големиот ден",
      units: { days: "дена", hours: "часа", min: "мин", sec: "сек" },
      aria: (d, h, m) => `Уште ${d} дена, ${h} часа и ${m} минути до свадбата`,
    },
    rsvp: {
      title: "Потврда со еден допир",
      text: "Број на гости и избор на мени, директно на вашиот е-мејл.",
      yes: "Да, ќе дојдеме",
      no: "Не можеме да дојдеме",
      guests: "Гости",
      fewer: "Помалку гости",
      more: "Повеќе гости",
      sentYes: "✓ Испратено до Ана и Марко",
      sentNo: "✓ Ана и Марко ќе ја добијат вашата порака",
      guestCount: (n) => `${n} ${n === 1 ? "гостин" : "гости"}`,
    },
    directions: {
      title: "Насоки со еден допир",
      text: "Црква, сала и паркинг, директно во нивната апликација за мапи.",
      places: ["Црква", "Сала", "Паркинг"],
    },
    language: {
      title: "Македонски или англиски",
      text: "Или двата, со копче за гостите од странство.",
      switchLabel: "Јазик на поканата",
    },
  },
  pricing: {
    eyebrow: "Цени",
    title: "Едноставни цени, еднократно плаќање",
    lede: "Без претплата. Плаќате еднаш по настан.",
    currency: "ден.",
    badge: "Секој пакет: секоја потврда стигнува директно на вашата е-пошта",
    plans: [
      {
        name: "Essential",
        ribbon: "",
        features: ["Кој било активен шаблон", "Вашите имиња, датум, програма, мапа", "До [N] фотографии"],
        cta: "Изберете Essential",
      },
      {
        name: "Signature",
        ribbon: "Најбаран",
        features: ["Сè од Essential", "Музика во позадина и фото-галерија", "Два јазика"],
        cta: "Изберете Signature",
      },
    ],
  },
  faq: {
    eyebrow: "Прашања",
    title: "Прашања што можеби ги имате",
    items: [
      {
        q: "Колку време е потребно?",
        a: "Обично [N] работни дена откако ќе ги добиеме вашите детали и фотографии. Помалите измени потоа се брзи.",
      },
      {
        q: "Дали на гостите им треба апликација или профил?",
        a: "Не. Го отвораат линкот во WhatsApp, Viber или SMS и сè работи во прелистувачот на телефонот.",
      },
      {
        q: "Може ли да ги смениме деталите откако ќе се објави?",
        a: "Да. Линкот останува ист, па гостите секогаш ја гледаат најновата програма, време или место.",
      },
      {
        q: "Како гледаме кој доаѓа?",
        a: "Секоја потврда стигнува директно на вашата е-пошта, со имиња, број на гости и избор на мени.",
      },
      {
        q: "Колку долго поканата останува онлајн?",
        a: "[N] месеци по настанот, за гостите да можат да се вратат на фотографиите и спомените.",
      },
    ],
  },
  contact: {
    eyebrow: "Јавете ни се",
    title: "Ајде да направиме нешто што гостите ќе го сакаат.",
    lede: "Изберете шаблон, испратете ни ги деталите и ќе ви се јавиме со персонализиран преглед.",
    emailLabel: "Е-ПОШТА",
    name: "Име",
    namePlaceholder: "Вашето име",
    contact: "Е-пошта или телефон",
    contactPlaceholder: "Како да ве контактираме?",
    template: "Шаблон што ве интересира",
    notSure: "Сè уште не знам",
    message: "Порака",
    messagePlaceholder: "Кажете ни за настанот — датум, број на гости, сè друго",
    send: "Испрати порака",
    sending: "Се испраќа…",
    sentTitle: "Пораката е испратена!",
    sentText: "Ќе ви се јавиме со преглед.",
    again: "Испрати уште една",
    error: (email) => `Нешто тргна наопаку — обидете се повторно или пишете ни на ${email}.`,
    orWrite: "или пишете ни на",
  },
  footer: {
    tagline: "Дигитални покани за моменти што вредат да се паметат.",
    rights: (year, name) => `© ${year} ${name}`,
  },
  cursor: { open: "Отвори" },
};

export const COPY: Record<Lang, Copy> = { en, mk };
