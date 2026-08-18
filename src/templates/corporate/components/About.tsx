import { CorporateConfig } from "../types";

interface Props {
  config: CorporateConfig;
}

export default function About({ config }: Props) {
  return (
    <section className="tpl-section" data-reveal-scale>
      <p className="tpl-label">About the event</p>
      <p className="tpl-sub-text">{config.about}</p>
    </section>
  );
}
