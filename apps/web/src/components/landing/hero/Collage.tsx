import { useLang } from "../i18n";

/**
 * The hero's photos and stickers.
 *
 * Each piece: positioned item (mouse parallax) › drop/pop wrapper
 * (intro) › the visual (CSS tilt, hover, bob). Keeping the three
 * transforms on separate elements stops them fighting.
 */
export default function Collage() {
  const hero = useLang().t.hero;
  return (
    <div className="lp-hero__collage" aria-hidden>
      <div className="lp-hero__item lp-hero__item--one" data-par="16">
        <div className="lp-hero__drop" data-intro="drop" data-tilt="4">
          <div className="lp-hero__photo lp-hero__photo--one">
            <img src="/assets/1.jpg" alt="" />
          </div>
        </div>
      </div>
      <div className="lp-hero__item lp-hero__item--two" data-par="24">
        <div className="lp-hero__drop" data-intro="drop" data-tilt="-5">
          <div className="lp-hero__photo lp-hero__photo--two">
            <img src="/assets/2.jpg" alt="" />
          </div>
        </div>
      </div>
      <div className="lp-hero__item lp-hero__item--rsvp" data-par="18">
        <span className="lp-hero__popper" data-intro="popper">
          <span className="lp-hero__sticker lp-hero__sticker--rsvp">{hero.stickerRsvp}</span>
        </span>
      </div>
      <div className="lp-hero__item lp-hero__item--days" data-par="18">
        <span className="lp-hero__popper" data-intro="popper">
          <span className="lp-hero__sticker lp-hero__sticker--days">{hero.stickerDays}</span>
        </span>
      </div>
    </div>
  );
}
