import { CorporateConfig } from "../types";

interface Props {
  config: CorporateConfig;
}

export default function Agenda({ config }: Props) {
  return (
    <section className="tpl-section">
      <p className="tpl-label" data-reveal>
        Agenda
      </p>
      <div className="corp__agenda" data-reveal-group>
        {config.agenda.map((item, i) => (
          <div className="corp__agenda-item" data-reveal-item key={i}>
            <span className="corp__agenda-time">{item.time}</span>
            <div className="corp__agenda-body">
              <span className="corp__agenda-title">{item.title}</span>
              {item.speaker && (
                <span className="corp__agenda-speaker">{item.speaker}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
