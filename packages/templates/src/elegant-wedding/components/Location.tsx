import { useInvitation } from "../../engine/runtime";
import { useVenues } from "../../engine/hooks";
import { MapEmbed, MapsLink, OptionalText } from "../../engine/components";
import st from "../Template.module.scss";

export default function Location() {
  const { t } = useInvitation();
  const { heading, venues } = useVenues();
  return (
    <section className={st["inv__section"]} data-gsap="location">
      <p className={st["inv__label"]}>{heading}</p>
      {venues.map((venue) => (
        // "inv__location" has no styles; kept as a plain hook class.
        <div key={venue.id} className="inv__location">
          <OptionalText as="p" className={st["inv__sub-text"]}>
            {t(venue.label)}
          </OptionalText>
          <p className={st["inv__location-name"]}>{t(venue.name)}</p>
          <p className={`${st["inv__sub-text"]} ${st.location}`}>{t(venue.address)}</p>
          <div className={st["inv__map-wrap"]}>
            <MapEmbed venue={venue} className={st["inv__map-iframe"]} />
            <MapsLink venue={venue} className={st["inv__map-overlay-link"]} />
          </div>
        </div>
      ))}
    </section>
  );
}
