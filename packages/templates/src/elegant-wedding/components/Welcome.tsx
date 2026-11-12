import { useInvitation } from "../../engine/runtime";
import st from "../Template.module.scss";

export default function Welcome() {
  const { t, event } = useInvitation();
  const w = event.content.welcome;
  const text = t(w?.text);
  return (
    <section className={st["inv__section"]} data-gsap="welcome">
      <div className={st["inv__divider"]} />
      <p className={st["inv__label"]}>{t(w?.heading)}</p>
      <p className={st["inv__welcome-text"]}>
        {text.split("\n").map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </p>
    </section>
  );
}
