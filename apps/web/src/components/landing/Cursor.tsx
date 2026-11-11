import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Only elements that ask for a label (data-cursor="…") turn the ring into a
// pill; plain links and buttons keep the ring (no generic "Open" tooltip).
const INTERACTIVE = "[data-cursor]:not([data-cursor=''])";

/**
 * Custom cursor + magnetic buttons (HANDOFF-ANIMATIONS B8). Desktop with a
 * fine pointer and motion allowed only; the native cursor stays visible.
 *
 * - A 16px coral dot follows the pointer. Over links and buttons it becomes a
 *   dark pill; `data-cursor="Label"` on any element sets the pill's label
 *   (only elements with a non-empty data-cursor get a label).
 * - `data-magnetic` on an element pulls it toward the pointer (up to ~13px x,
 *   ~9px y) and springs it back on leave.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  // Read inside the pointer handlers, so it always has the current language.

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const el = root.current!;
        const dot = el.querySelector(".lp-cursor__dot")!;
        const pill = el.querySelector(".lp-cursor__pill")!;
        const xTo = gsap.quickTo(el, "x", { duration: 0.2, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.2, ease: "power3.out" });
        let hovering: Element | null = null;

        const morph = (target: Element | null) => {
          if (target === hovering) return;
          hovering = target;
          const text = target?.getAttribute("data-cursor") ?? "";
          setLabel(text);
          gsap.to(dot, { scale: target ? 0 : 1, duration: 0.2, overwrite: true });
          gsap.to(pill, { scale: target ? 1 : 0, autoAlpha: target ? 1 : 0, duration: 0.25, ease: "back.out(2)", overwrite: true });
        };

        let shown = false;
        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          // Fade in once, not a new tween on every move event.
          if (!shown) {
            shown = true;
            gsap.to(el, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
          }
          xTo(e.clientX);
          yTo(e.clientY);
          const target = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
          // Form fields and the header nav keep the plain dot (no pill).
          morph(target && !target.closest("input, select, textarea, .lp-header") ? target : null);
        };
        const onLeave = () => {
          shown = false;
          gsap.to(el, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
          morph(null);
        };

        // Magnetic elements: pull toward the pointer, spring back on leave.
        // The hero intro (hero/useHeroIntro.ts) drives the ones inside it.
        const magnets = gsap.utils.toArray<HTMLElement>("[data-magnetic]").filter((m) => !m.closest(".lp-intro"));
        const cleanups = magnets.map((m) => {
          const mx = gsap.quickTo(m, "x", { duration: 0.3, ease: "power3.out" });
          const my = gsap.quickTo(m, "y", { duration: 0.3, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = m.getBoundingClientRect();
            mx(((e.clientX - r.left) / r.width - 0.5) * 26);
            my(((e.clientY - r.top) / r.height - 0.5) * 18);
          };
          const leave = () => gsap.to(m, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
          m.addEventListener("pointermove", move);
          m.addEventListener("pointerleave", leave);
          return () => {
            m.removeEventListener("pointermove", move);
            m.removeEventListener("pointerleave", leave);
            gsap.set(m, { clearProps: "transform" });
          };
        });

        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
          cleanups.forEach((c) => c());
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="lp-cursor" ref={root} aria-hidden>
      <span className="lp-cursor__dot" />
      <span className="lp-cursor__pill">{label}</span>
    </div>
  );
}
