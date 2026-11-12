import { useInvitation } from "../../engine/runtime";
import st from "../Template.module.scss";

export default function Program() {
  const { t, event } = useInvitation();
  const p = event.content.program;
  return (
    <section className={st["inv__section"]} data-gsap="program">
      <p className={st["inv__label"]}>{t(p?.heading)}</p>
      <div className={st["inv__timeline"]}>
        {p?.items.map((item) => (
          <span key={item.id} className={st["inv__timeline-event"]}>
            <span>{item.time}</span> &nbsp;-&nbsp; {t(item.title)}
            {t(item.place) && <> ({t(item.place)})</>}&nbsp;
          </span>
        ))}
      </div>
    </section>
  );
}
