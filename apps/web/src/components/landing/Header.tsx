import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@momentelo/ui";
import { LangToggle, useLang } from "./i18n";
import { lockScroll } from "./scrollLock";

// Confetti across the bottom of the phone menu.
const MENU_CONFETTI = [
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

export default function Header({ businessName, logoUrl }: { businessName: string; logoUrl?: string | null }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  // Phone menu: lock page scroll while open (the menu itself still scrolls;
  // the scrollbar stays, so nothing shifts), close on Escape.
  const unlockRef = useRef<(() => void) | null>(null);
  const scrollbarTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(scrollbarTimer.current), []);
  useEffect(() => {
    if (!open) return;
    unlockRef.current = lockScroll(document.getElementById("lp-menu"));
    const html = document.documentElement;
    clearTimeout(scrollbarTimer.current);
    html.classList.add("lp-menu-open"); // hides the scrollbar (CSS)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      unlockRef.current?.();
      unlockRef.current = null;
      // Bring the scrollbar back only once the menu has finished rolling up.
      scrollbarTimer.current = window.setTimeout(() => html.classList.remove("lp-menu-open"), 420);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  // A menu link unlocks right away, before its smooth scroll starts.
  const closeForLink = () => {
    unlockRef.current?.();
    unlockRef.current = null;
    setOpen(false);
  };

  const links = [
    { href: "#templates", label: t.nav.templates },
    { href: "#how", label: t.nav.how },
    { href: "#pricing", label: t.nav.pricing },
  ];

  return (
    <header className={`lp-header${open ? " lp-header--open" : ""}`}>
      <div className="lp-wrap lp-header__row">
        <a href="/" className="lp-header__brand" aria-label={t.nav.home(businessName)}>
          {/* The hero intro (Hero.tsx) flies its card logo into this slot. An
              uploaded logo (Admin › Settings) replaces the Momentelo logo. */}
          <span className="lp-header__logo" data-header-logo>
            {logoUrl ? <img className="ui-wordmark ui-wordmark--md" src={logoUrl} alt={businessName} /> : <Wordmark text={businessName} />}
          </span>
        </a>
        <nav aria-label={t.nav.label} className="lp-header__nav" data-header-nav>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="lp-header__link">
              {l.label}
            </a>
          ))}
          <LangToggle />
          <a href="#contact" className="lp-header__cta" data-magnetic>
            {t.nav.contact}
          </a>
          {/* Phones: the links and button move into a full-screen menu. */}
          <button
            type="button"
            className="lp-header__burger"
            aria-expanded={open}
            aria-controls="lp-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </div>

      {/* Always rendered so it can animate in and out; while closed it is
          visibility: hidden (no clicks, not read out). */}
      <div id="lp-menu" className={`lp-menu${open ? " lp-menu--open" : ""}`} aria-hidden={!open}>
        <nav aria-label={t.nav.label} className="lp-menu__nav" onClick={(e) => (e.target as Element).closest("a") && closeForLink()}>
          {[...links, { href: "#faq", label: t.nav.faq }].map((l, i) => (
            <a key={l.href} href={l.href} className="lp-menu__link" style={{ "--i": i } as React.CSSProperties}>
              {l.label}
            </a>
          ))}
          <a href="#contact" className="lp-menu__cta" style={{ "--i": 4 } as React.CSSProperties}>
            {t.nav.contact}
          </a>
        </nav>
        <div className="lp-menu__confetti" aria-hidden>
          {MENU_CONFETTI.map((c, i) => (
            <span
              key={i}
              style={
                {
                  left: c.left,
                  bottom: c.bottom,
                  width: c.w,
                  height: c.h,
                  borderRadius: c.w === c.h ? "50%" : 6,
                  background: c.color,
                  "--rot": `${c.rot}deg`,
                  "--i": i,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </header>
  );
}
