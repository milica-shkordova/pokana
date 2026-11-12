import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useIsoLayoutEffect, useSlidingIndicator } from "@pokanito/ui";
import { COPY, LANGS, type Copy, type Lang } from "@/content/landing";
import { requestScrollRefresh } from "./scrollRefresh";

const STORAGE_KEY = "pokanito:lang";

interface LangValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** The landing copy in the current language. */
  t: Copy;
  /** True once the saved language has been restored (client only). */
  ready: boolean;
}

const LangContext = createContext<LangValue>({ lang: "en", setLang: () => undefined, t: COPY.en, ready: true });

/**
 * Landing page language (English / Macedonian). The page renders in English
 * on the server; the visitor's choice is remembered in localStorage and
 * restored after hydration. Keeps <html lang> in sync.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && (LANGS as string[]).includes(saved)) setLangState(saved as Lang);
    } catch {
      // Storage blocked: stay on the default.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    // Text lengths change with the language, so pinned and measured
    // sections (journey ribbon, gallery) re-measure.
    requestScrollRefresh();
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered, but still switched for this visit.
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: COPY[lang], ready }), [lang, setLang, ready]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  return useContext(LangContext);
}

/**
 * МК / EN switch for the header. A terracotta pill slides behind the chosen
 * language (measured from the buttons, so it fits either label exactly).
 */
export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const [placed, setPlaced] = useState(false);

  // Move the pill under the active button; re-measure when sizes change
  // (fonts loading, language labels).
  const [group, pill] = useSlidingIndicator<HTMLDivElement>(".lp-lang__opt--on", [lang]);
  useIsoLayoutEffect(() => {
    // Only animate moves after the first placement (no slide-in on load).
    const id = requestAnimationFrame(() => setPlaced(true));
    return () => cancelAnimationFrame(id);
  }, [lang]);

  return (
    <div
      ref={group}
      className={`lp-lang${placed ? " lp-lang--placed" : ""}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={t.lang.label}
    >
      <span
        className="lp-lang__thumb"
        style={pill ? { width: pill.width, transform: `translateX(${pill.left}px)` } : undefined}
        aria-hidden
      />
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={`lp-lang__opt${lang === l ? " lp-lang__opt--on" : ""}`}
          aria-pressed={lang === l}
          lang={l}
          onClick={() => setLang(l)}
        >
          {t.lang[l]}
        </button>
      ))}
    </div>
  );
}
