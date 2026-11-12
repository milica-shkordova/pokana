import { Wordmark } from "@pokanito/ui";
import { fmt } from "@/content/landing";
import { LangToggle, useLang } from "./i18n";
import { MENU_CONFETTI, MENU_EXTRA_LINK, MENU_ID, NAV_LINKS } from "./header/constants";
import { useMobileMenu } from "./header/useMobileMenu";
import type { HeaderProps } from "./header/types";

export default function Header({ businessName, logoUrl }: HeaderProps) {
  const { t } = useLang();
  // Phone menu: scroll lock, Escape, link clicks (header/useMobileMenu.ts).
  const { open, setOpen, closeForLink } = useMobileMenu();

  const links = NAV_LINKS.map((l) => ({ href: l.href, label: t.nav[l.key] }));

  return (
    <header className={`lp-header${open ? " lp-header--open" : ""}`}>
      <div className="lp-wrap lp-header__row">
        <a href="/" className="lp-header__brand" aria-label={fmt(t.nav.home, { name: businessName })}>
          {/* The hero intro (Hero.tsx) flies its card logo into this slot. An
              uploaded logo (Admin › Settings) replaces the Pokanito logo. */}
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
            aria-controls={MENU_ID}
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
      <div id={MENU_ID} className={`lp-menu${open ? " lp-menu--open" : ""}`} aria-hidden={!open}>
        <nav aria-label={t.nav.label} className="lp-menu__nav" onClick={(e) => (e.target as Element).closest("a") && closeForLink()}>
          {[...links, { href: MENU_EXTRA_LINK.href, label: t.nav[MENU_EXTRA_LINK.key] }].map((l, i) => (
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
