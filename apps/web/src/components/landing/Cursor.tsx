import { useCustomCursor } from "./cursor/useCustomCursor";

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
  const { root, label } = useCustomCursor();

  return (
    <div className="lp-cursor" ref={root} aria-hidden>
      <span className="lp-cursor__dot" />
      <span className="lp-cursor__pill">{label}</span>
    </div>
  );
}
