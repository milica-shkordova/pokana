import config from "@/config";

export default function Location() {
  return (
    <section className="inv__section" data-gsap="location">
      <p className="inv__label">Локација</p>
      <p className="inv__location-name">{config.venue.name}</p>
      <p className="inv__sub-text location">{config.venue.address}</p>
      <div className="inv__map-wrap">
        <iframe
          className="inv__map-iframe"
          src={`https://maps.google.com/maps?q=${config.venue.mapsQuery}&output=embed&z=16`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          className="inv__map-overlay-link"
          href={config.venue.mapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Отвори на мапа ↗
        </a>
      </div>
    </section>
  );
}
