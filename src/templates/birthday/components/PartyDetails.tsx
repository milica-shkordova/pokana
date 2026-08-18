import { BirthdayConfig } from "../types";

interface Props {
  config: BirthdayConfig;
}

export default function PartyDetails({ config }: Props) {
  if (!config.details.length) return null;

  return (
    <section className="tpl-section">
      <p className="tpl-label" data-reveal>
        Party details
      </p>
      <div className="bday__details" data-reveal-group>
        {config.details.map((d) => (
          <div className="bday__detail-chip" data-reveal-item key={d.label}>
            <span className="bday__detail-label">{d.label}</span>
            <span className="bday__detail-value">{d.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
