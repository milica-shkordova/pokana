import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import type { MenuProps } from "./types";

/**
 * Small accessible dropdown (menu button pattern): Enter/Space/↓ opens,
 * arrows move, Esc/Tab/outside click close, focus returns to the button.
 */
export function Menu({
  label,
  items,
  trigger = "⋯",
  classPrefix: c = "admin-menu",
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  // The list is portalled to .ui-root with fixed positioning so scroll
  // containers (e.g. the events table) never clip it.
  const [pos, setPos] = useState<CSSProperties>({ visibility: "hidden" });

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const b = button.current?.getBoundingClientRect();
      const l = list.current;
      if (!b || !l) return;
      const h = l.offsetHeight;
      const below = window.innerHeight - b.bottom;
      const top =
        below < h + 12 && b.top > h + 12 ? b.top - h - 4 : b.bottom + 4;
      setPos({ top, right: Math.max(8, window.innerWidth - b.right) });
    };
    place();
    const onScroll = (e: Event) => {
      if (!list.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
      setPos({ visibility: "hidden" });
    };
  }, [open]);

  const focusItem = (i: number) => {
    const els =
      list.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]");
    if (!els?.length) return;
    els[(i + els.length) % els.length].focus();
  };

  useEffect(() => {
    if (!open) return;
    focusItem(0);
    const onDown = (e: MouseEvent) => {
      if (
        !list.current?.contains(e.target as Node) &&
        !button.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  };

  return (
    <div className={c}>
      <button
        ref={button}
        type="button"
        className={`${c}__button`}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {trigger}
      </button>
      {open &&
        createPortal(
          <div
            ref={list}
            id={id}
            role="menu"
            aria-label={label}
            className={`${c}__list`}
            style={pos}
            onKeyDown={(e) => {
              const els = [
                ...(list.current?.querySelectorAll<HTMLButtonElement>(
                  "[role=menuitem]",
                ) ?? []),
              ];
              const i = els.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              if (e.key === "ArrowDown") {
                e.preventDefault();
                focusItem(i + 1);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                focusItem(i - 1);
              } else if (e.key === "Home") {
                e.preventDefault();
                focusItem(0);
              } else if (e.key === "End") {
                e.preventDefault();
                focusItem(els.length - 1);
              } else if (e.key === "Escape") {
                e.preventDefault();
                close();
              } else if (e.key === "Tab") {
                close(false);
              }
            }}
          >
            {items.map((item, i) => (
              <Fragment key={item.label}>
                {item.divider && <div role="separator" className={`${c}__divider`} />}
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={
                    item.danger
                      ? `${c}__item ${c}__item--danger`
                      : `${c}__item`
                  }
                  style={{ "--i": i } as CSSProperties}
                  onClick={() => {
                    close();
                    item.onSelect();
                  }}
                >
                  {item.icon && <span className={`${c}__icon`}>{item.icon}</span>}
                  <span className={`${c}__label`}>{item.label}</span>
                  {item.hint && <span className={`${c}__hint`}>{item.hint}</span>}
                </button>
              </Fragment>
            ))}
          </div>,
          button.current?.closest<HTMLElement>(".ui-root") ?? document.body,
        )}
    </div>
  );
}
