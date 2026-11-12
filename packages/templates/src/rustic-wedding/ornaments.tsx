import st from "./Template.module.scss";

/** Olive sprig divider; `full={false}` drops the outer leaves. */
export function Sprig({ full = true }: { full?: boolean }) {
  return (
    <svg className={st.sprig} width="120" height="28" viewBox="0 0 120 28" fill="none" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
      <path d="M4 14h112" />
      <path d="M60 14c-6-8-14-10-20-8 4 6 12 8 20 8zM60 14c6-8 14-10 20-8-4 6-12 8-20 8z" />
      {full && <path d="M40 14c-4-5-9-6-13-5 3 4 8 5 13 5zM80 14c4-5 9-6 13-5-3 4-8 5-13 5z" />}
    </svg>
  );
}

/** Map pin above each venue card. */
export function Pin() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" aria-hidden className={st.pin}>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
