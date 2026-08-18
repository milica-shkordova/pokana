import { ChristeningConfig } from "../types";

interface Props {
  config: ChristeningConfig;
}

export default function Welcome({ config }: Props) {
  return (
    <section className="tpl-section" data-reveal-scale>
      <div className="tpl-divider" />
      <p className="tpl-label">With joyful hearts</p>
      <p className="tpl-sub-text">{config.message}</p>
      <p className="christen__parent-names">{config.parentNames}</p>
    </section>
  );
}
