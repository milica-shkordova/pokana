import type { RefObject } from "react";
import { useInvitation } from "../../engine/runtime";
import { Photo } from "../../engine/components";

interface Props {
  heroRef: RefObject<HTMLElement>;
  heroTextRef: RefObject<HTMLDivElement>;
  heroImgWrapRef: RefObject<HTMLDivElement>;
}

export default function Hero({ heroRef, heroTextRef, heroImgWrapRef }: Props) {
  const { t, date, event } = useInvitation();
  const c = event.content;
  const venue = c.location?.venues[0];
  const one = t(c.partnerOne);
  const two = t(c.partnerTwo);

  return (
    <section className="inv__hero" ref={heroRef}>
      <div className="inv__hero-text" ref={heroTextRef}>
        <p className="inv__hero-date">{date()}</p>
        <p className="inv__hero-venue">{venue ? t(venue.name) : t(c.city)}</p>
        <div className="inv__divider" />
        <h1 className="inv__names">
          {one && two ? (
            <>
              <span>{one}</span>
              <span className="inv__amp">&amp;</span>
              <span>{two}</span>
            </>
          ) : (
            <span>{t(c.names)}</span>
          )}
        </h1>
        <div className="inv__divider" />
      </div>
      <div className="inv__hero-image-wrap inv__hero-image-wrap--main" ref={heroImgWrapRef}>
        <Photo slot="hero" className="inv__hero-img" priority />
        <div className="inv__hero-img-overlay" />
        <div className="inv__hero-img-fade" />
      </div>
    </section>
  );
}
