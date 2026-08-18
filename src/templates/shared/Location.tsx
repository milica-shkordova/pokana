interface Props {
  label: string;
  name: string;
  address: string;
  mapsQuery: string;
  mapsUrl: string;
  linkLabel?: string;
}

export default function Location({
  label,
  name,
  address,
  mapsQuery,
  mapsUrl,
  linkLabel = "Open in Maps ↗",
}: Props) {
  return (
    <section className="tpl-section" data-reveal>
      <p className="tpl-label">{label}</p>
      <p className="tpl-location-name">{name}</p>
      <p className="tpl-sub-text">{address}</p>
      <div className="tpl-map-wrap">
        <iframe
          className="tpl-map-iframe"
          src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed&z=16`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          className="tpl-map-overlay-link"
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          {linkLabel}
        </a>
      </div>
    </section>
  );
}
