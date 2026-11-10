import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "../cx";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /** Confirm-style header: a tinted icon tile above the title. */
  icon?: ReactNode;
  iconTone?: "warn" | "danger";
  /** No × button (confirm dialogs close with Cancel / Esc / the backdrop). */
  hideClose?: boolean;
}

/** Matches the `ui-dialog-out` animation in _surfaces.scss. */
const CLOSE_MS = 160;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Modal built on the native <dialog>: focus trap, Esc to close and inert
 * background come for free. It animates in (backdrop fades, panel rises and
 * scales up) and out: on close the content stays rendered for the short exit
 * animation, then the native dialog closes.
 */
export function Dialog({ open, onClose, title, children, footer, wide, icon, iconTone = "warn", hideClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Content stays mounted while the exit animation plays.
  const [shown, setShown] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      setShown(true);
      setClosing(false);
      if (!d.open) d.showModal();
      return;
    }
    if (!d.open) {
      setShown(false);
      return;
    }
    if (reducedMotion()) {
      d.close();
      setShown(false);
      return;
    }
    setClosing(true);
    const t = window.setTimeout(() => {
      d.close();
      setClosing(false);
      setShown(false);
    }, CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx("ui-dialog", wide && "ui-dialog--wide", closing && "ui-dialog--closing")}
      onClose={() => {
        // Closed by the browser (e.g. a form with method="dialog"): sync state.
        if (open) onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // backdrop click
      }}
    >
      {(open || shown) && (
        <div className="ui-dialog__inner">
          <div className={cx("ui-dialog__header", !!icon && "ui-dialog__header--icon")}>
            {icon && (
              <span className={cx("ui-dialog__icon", `ui-dialog__icon--${iconTone}`)} aria-hidden>
                {icon}
              </span>
            )}
            <h2 className="ui-dialog__title">{title}</h2>
            {!hideClose && (
              <button type="button" className="ui-dialog__close" aria-label="Close" onClick={onClose}>
                ×
              </button>
            )}
          </div>
          {children}
          {footer && <div className="ui-dialog__footer">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
