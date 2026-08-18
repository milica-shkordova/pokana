import { useRef } from "react";
import { ChristeningConfig } from "../types";
import { useCircleReveal } from "../../shared/useCircleReveal";

interface Props {
  config: ChristeningConfig;
}

export default function Hero({ config }: Props) {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  useCircleReveal(imgWrapRef);

  return (
    <section className="christen__hero">
      <div className="christen__hero-image-wrap" ref={imgWrapRef}>
        <img className="christen__hero-img" src={config.images.hero} alt="" />
      </div>
      <div data-reveal-scale>
        <p className="tpl-sub-text">{config.ceremonyDateLabel}</p>
        <h1 className="christen__hero-title">The Christening of {config.childName}</h1>
      </div>
    </section>
  );
}
