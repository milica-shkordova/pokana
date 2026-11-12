import { useEffect, useRef, useState } from "react";
import { lockScroll } from "../scrollLock";
import { MENU_CLOSE_MS, MENU_ID, MENU_OPEN_CLASS } from "./constants";

/**
 * Phone menu: lock page scroll while open (the menu itself still scrolls;
 * the scrollbar stays, so nothing shifts), close on Escape. `closeForLink`:
 * a menu link unlocks right away, before its smooth scroll starts.
 */
export function useMobileMenu() {
  const [open, setOpen] = useState(false);

  const unlockRef = useRef<(() => void) | null>(null);
  const scrollbarTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(scrollbarTimer.current), []);
  useEffect(() => {
    if (!open) return;
    unlockRef.current = lockScroll(document.getElementById(MENU_ID));
    const html = document.documentElement;
    clearTimeout(scrollbarTimer.current);
    html.classList.add(MENU_OPEN_CLASS); // hides the scrollbar (CSS)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      unlockRef.current?.();
      unlockRef.current = null;
      // Bring the scrollbar back only once the menu has finished rolling up.
      scrollbarTimer.current = window.setTimeout(() => html.classList.remove(MENU_OPEN_CLASS), MENU_CLOSE_MS);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  // A menu link unlocks right away, before its smooth scroll starts.
  const closeForLink = () => {
    unlockRef.current?.();
    unlockRef.current = null;
    setOpen(false);
  };

  return { open, setOpen, closeForLink };
}
