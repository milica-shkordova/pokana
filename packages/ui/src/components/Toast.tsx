import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cx } from "../cx";

interface ToastItem {
  id: number;
  message: ReactNode;
  tone: "default" | "error";
  /** Playing its exit animation; removed right after. */
  leaving?: boolean;
}

/** Matches the `ui-toast-out` animation in _surfaces.scss. */
const LEAVE_MS = 200;

type ShowToast = (message: ReactNode, tone?: ToastItem["tone"]) => void;

const ToastContext = createContext<ShowToast>(() => undefined);

let nextId = 0;

/** Wrap the app once; then `const toast = useToast(); toast("Link copied")`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback<ShowToast>((message, tone = "default") => {
    const id = ++nextId;
    setItems((list) => [...list, { id, message, tone }]);
    const life = tone === "error" ? 6000 : 3000;
    // Fade/slide out first, then remove.
    setTimeout(() => setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t))), life);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), life + LEAVE_MS);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="ui-toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cx("ui-toast", t.tone === "error" && "ui-toast--error", t.leaving && "ui-toast--leaving")}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  return useContext(ToastContext);
}
