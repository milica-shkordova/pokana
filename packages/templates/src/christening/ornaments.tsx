import st from "./Template.module.scss";

/** Two flowering branches framing the hero. */
export function Florals() {
  return (
    <svg className={st.florals} viewBox="0 0 390 120" fill="none" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
      <path d="M0 40 C60 30 90 70 150 60" />
      <path d="M40 36c-6-14 4-22 12-24 2 10-4 20-12 24zM90 52c10-10 22-8 28-2-8 8-20 8-28 2z" />
      <circle cx="150" cy="60" r="6" className={st.petal} />
      <circle cx="160" cy="54" r="4" className={st.petal} />
      <path d="M390 30 C330 24 300 62 240 54" />
      <path d="M350 28c6-14-4-22-12-24-2 10 4 20 12 24zM300 46c-10-10-22-8-28-2 8 8 20 8 28 2z" />
      <circle cx="240" cy="54" r="6" className={st.petal} />
      <circle cx="230" cy="48" r="4" className={st.petal} />
    </svg>
  );
}

/** Line with a petal in the middle, above the footer name. */
export function FooterLine() {
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none" strokeWidth="1.4" strokeLinecap="round" aria-hidden className={st.footerLine}>
      <path d="M2 12h56" />
      <circle cx="30" cy="12" r="5" className={st.petal} />
    </svg>
  );
}
