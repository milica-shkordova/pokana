import { useInvitation } from "../../engine/runtime";

export default function Welcome() {
  const { t, event } = useInvitation();
  const w = event.content.welcome;
  const text = t(w?.text);
  return (
    <section className="inv__section" data-gsap="welcome">
      <div className="inv__divider" />
      <p className="inv__label">{t(w?.heading)}</p>
      <p className="inv__welcome-text">
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
