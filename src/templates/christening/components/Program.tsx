import { ChristeningConfig } from "../types";

interface Props {
  config: ChristeningConfig;
}

export default function Program({ config }: Props) {
  return (
    <section className="tpl-section">
      <p className="tpl-label" data-reveal>
        Program
      </p>
      <div className="christen__program" data-reveal-group>
        {config.program.map((event, i) => (
          <span className="christen__program-event" data-reveal-item key={i}>
            <span className="christen__program-time">{event.time}</span>
            {" — "}
            {event.description}
          </span>
        ))}
      </div>
    </section>
  );
}
