import { useInvitation } from "../../engine/runtime";
import { MapEmbed, MapsLink } from "../../engine/components";

export default function Location() {
  const { t, event } = useInvitation();
  const loc = event.content.location;
  return (
    <section className="inv__section" data-gsap="location">
      <p className="inv__label">{t(loc?.heading)}</p>
      {loc?.venues.map((venue) => (
        <div key={venue.id} className="inv__location">
          {t(venue.label) && <p className="inv__sub-text">{t(venue.label)}</p>}
          <p className="inv__location-name">{t(venue.name)}</p>
          <p className="inv__sub-text location">{t(venue.address)}</p>
          <div className="inv__map-wrap">
            <MapEmbed venue={venue} className="inv__map-iframe" />
            <MapsLink venue={venue} className="inv__map-overlay-link" />
          </div>
        </div>
      ))}
    </section>
  );
}
