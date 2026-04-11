import { RefObject } from "react";
import config from "@/config";

interface Props {
  heroRef: RefObject<HTMLElement>;
  heroTextRef: RefObject<HTMLDivElement>;
  heroImgWrapRef: RefObject<HTMLDivElement>;
}

export default function Hero({ heroRef, heroTextRef, heroImgWrapRef }: Props) {
  return (
    <section className="inv__hero" ref={heroRef}>
      <div className="inv__hero-text" ref={heroTextRef}>
        <p className="inv__hero-date">{config.weddingDateLabel}</p>
        <p className="inv__hero-venue">{config.venue.name}</p>
        <div className="inv__divider" />
        <div className="inv__names">
          <span>{config.bride}</span>
          <span className="inv__amp">&amp;</span>
          <span>{config.groom}</span>
        </div>
        <div className="inv__divider" />
      </div>
      <div
        className="inv__hero-image-wrap inv__hero-image-wrap--main"
        ref={heroImgWrapRef}
      >
        <img className="inv__hero-img" src={config.images.hero} alt="" />
        <div className="inv__hero-img-overlay" />
        <div className="inv__hero-img-fade" />
      </div>
    </section>
  );
}
