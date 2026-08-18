import { CorporateConfig } from "../types";

interface Props {
  config: CorporateConfig;
}

export default function Hero({ config }: Props) {
  return (
    <section className="corp__hero" data-reveal-scale>
      <p className="corp__hero-eyebrow">{config.eventDateLabel}</p>
      <h1 className="corp__hero-title">{config.eventName}</h1>
      <p className="corp__hero-tagline">{config.tagline}</p>
    </section>
  );
}
