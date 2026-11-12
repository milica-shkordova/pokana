import { useInvitation } from "../../engine/runtime";
import { Photo } from "../../engine/components";
import type { HeroRefs } from "../types";
import st from "../Template.module.scss";

export default function Hero({ heroRef, heroTextRef, heroImgWrapRef }: HeroRefs) {
  const { t, date, event } = useInvitation();
  const c = event.content;
  const venue = c.location?.venues[0];
  const one = t(c.partnerOne);
  const two = t(c.partnerTwo);

  return (
    <section className={st["inv__hero"]} ref={heroRef}>
      <div className={st["inv__hero-text"]} ref={heroTextRef}>
        <p className={st["inv__hero-date"]}>{date()}</p>
        <p className={st["inv__hero-venue"]}>{venue ? t(venue.name) : t(c.city)}</p>
        <div className={st["inv__divider"]} />
        <h1 className={st["inv__names"]}>
          {one && two ? (
            <>
              <span>{one}</span>
              <span className={st["inv__amp"]}>&amp;</span>
              <span>{two}</span>
            </>
          ) : (
            <span>{t(c.names)}</span>
          )}
        </h1>
        <div className={st["inv__divider"]} />
      </div>
      <div className={`${st["inv__hero-image-wrap"]} ${st["inv__hero-image-wrap--main"]}`} ref={heroImgWrapRef}>
        <Photo slot="hero" className={st["inv__hero-img"]} priority />
        <div className={st["inv__hero-img-overlay"]} />
        <div className={st["inv__hero-img-fade"]} />
      </div>
    </section>
  );
}
