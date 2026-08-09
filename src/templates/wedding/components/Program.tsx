import { WeddingConfig } from "../types";

interface Props {
  config: WeddingConfig;
}

export default function Program({ config }: Props) {
  return (
    <section className="inv__section" data-gsap="program">
      <p className="inv__label">Програма</p>
      <div className="inv__timeline">
        {config.program.map((event, i) => (
          <span key={i} className="inv__timeline-event">
            <span>{event.time}</span> &nbsp;-&nbsp; {event.description}&nbsp;
          </span>
        ))}
      </div>
    </section>
  );
}
