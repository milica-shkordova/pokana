import st from "./Template.module.scss";

/** White wave closing the hero. */
export function Wave() {
  return (
    <svg className={st.wave} viewBox="0 0 390 40" preserveAspectRatio="none" aria-hidden>
      <path d="M0 20 Q 24 0 48 20 T 96 20 T 144 20 T 192 20 T 240 20 T 288 20 T 336 20 T 384 20 T 432 20 V40 H0 Z" fill="#FFFFFF" />
    </svg>
  );
}
