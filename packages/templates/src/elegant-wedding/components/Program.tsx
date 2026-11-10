import { useInvitation } from "../../engine/runtime";

export default function Program() {
  const { t, event } = useInvitation();
  const p = event.content.program;
  return (
    <section className="inv__section" data-gsap="program">
      <p className="inv__label">{t(p?.heading)}</p>
      <div className="inv__timeline">
        {p?.items.map((item) => (
          <span key={item.id} className="inv__timeline-event">
            <span>{item.time}</span> &nbsp;-&nbsp; {t(item.title)}
            {t(item.place) && <> ({t(item.place)})</>}&nbsp;
          </span>
        ))}
      </div>
    </section>
  );
}
