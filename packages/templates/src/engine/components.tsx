import type { CSSProperties, ReactNode } from "react";
import { LOCALES, mapsEmbed, mapsLink, venueMapsQuery, type Venue } from "@pokanito/shared";
import { useInvitation } from "./runtime";
import { useMusic, type CountdownUnit } from "./hooks";

// Headless-ish building blocks. They carry behaviour and accessibility;
// templates pass classNames/styles for the look.

/** The venue's maps query, falling back to "name, address". */
export function useVenueQuery() {
  const { t } = useInvitation();
  return (v: Venue) => venueMapsQuery(v, t);
}

interface PhotoProps {
  /** A template photo slot id… */
  slot?: string;
  /** …or a media id directly (gallery, speakers). */
  mediaId?: string | null;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  /** Shown when the slot is empty (always in preview; in live only if `placeholderLabel` is set). */
  placeholderLabel?: string;
  placeholderClassName?: string;
  priority?: boolean;
}

/** Responsive <img> that respects the media's focal point. */
export function Photo({
  slot,
  mediaId,
  className,
  style,
  sizes = "(max-width: 480px) 100vw, 480px",
  placeholderLabel,
  placeholderClassName,
  priority,
}: PhotoProps) {
  const { photo, media, preview, def } = useInvitation();
  const m = slot ? photo(slot) : media(mediaId);
  if (!m) {
    if (!preview && !placeholderLabel) return null;
    const label = placeholderLabel ?? def.photoSlots.find((s) => s.id === slot)?.label ?? "Photo";
    return (
      <div className={placeholderClassName ?? className} style={style} data-photo-placeholder aria-hidden>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <img
      className={className}
      src={m.url}
      srcSet={m.srcSet}
      sizes={m.srcSet ? sizes : undefined}
      width={m.width ?? undefined}
      height={m.height ?? undefined}
      alt={m.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{ objectFit: "cover", objectPosition: `${m.focalX * 100}% ${m.focalY * 100}%`, ...style }}
    />
  );
}

interface MapProps {
  venue: Venue;
  className?: string;
  title?: string;
}

/** Google Maps embed (no API key needed). Lazy-loaded. */
export function MapEmbed({ venue, className, title }: MapProps) {
  const query = useVenueQuery()(venue);
  const { t } = useInvitation();
  if (!query) return null;
  return (
    <iframe
      className={className}
      src={mapsEmbed(query)}
      title={title ?? t(venue.name)}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

/** "Open in maps" deep link. */
export function MapsLink({ venue, className, children }: { venue: Venue; className?: string; children?: ReactNode }) {
  const query = useVenueQuery()(venue);
  const { s } = useInvitation();
  return (
    <a className={className} href={mapsLink(query)} target="_blank" rel="noreferrer">
      {children ?? s.openInMaps}
    </a>
  );
}

/** MK / EN switch, rendered only when the event has two languages. */
export function LanguageToggle({ className }: { className?: string }) {
  const { event, locale, setLocale, s } = useInvitation();
  if (event.languages.length < 2) return null;
  return (
    <div className={className ?? "pokanito-lang"} role="group" aria-label={s.language}>
      {LOCALES.filter((l) => event.languages.includes(l)).map((l) => (
        <button key={l} type="button" aria-pressed={l === locale} onClick={() => setLocale(l)} lang={l}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Floating "tap to play" music button, rendered only when the event has music. */
export function MusicButton({ className }: { className?: string }) {
  const music = useMusic();
  const { s, has } = useInvitation();
  if (!music.available || !has("music")) return null;
  return (
    <button
      type="button"
      className={className ?? "pokanito-music"}
      aria-pressed={music.playing}
      aria-label={music.playing ? s.pauseMusic : s.playMusic}
      onClick={music.toggle}
    >
      {music.playing ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
    </button>
  );
}

/** Small banner shown on previews. */
export function PreviewNotice() {
  const { preview, s } = useInvitation();
  if (!preview) return null;
  return <div className="pokanito-preview-notice">{s.previewNotice}</div>;
}

/** Multi-line text: blank lines become paragraphs, single newlines become <br>. */
export function Multiline({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className={className}>
          {para.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

/** `text` in a `<Tag>`, or nothing when it's empty (`{t(x) && <span>{t(x)}</span>}`). */
export function OptionalText({
  as: Tag = "span",
  className,
  children,
}: {
  as?: "span" | "p" | "h2";
  className?: string;
  children: string | null | undefined;
}) {
  if (!children) return null;
  return <Tag className={className}>{children}</Tag>;
}

/** `<MapEmbed>` in a wrapper (the wrapper renders even when there's no map query). */
export function MapFrame({ venue, classes }: { venue: Venue; classes: { wrap?: string; map?: string } }) {
  return (
    <div className={classes.wrap}>
      <MapEmbed venue={venue} className={classes.map} />
    </div>
  );
}

/** Count-down cells: `<div class=item><span class=num/><span class=unit/></div>` per unit. */
export function CountdownUnits({
  units,
  classes,
}: {
  units: CountdownUnit[];
  classes: { item?: string; num?: string; unit?: string };
}) {
  return (
    <>
      {units.map((u) => (
        <div key={u.label} className={classes.item}>
          <span className={classes.num}>{u.value}</span>
          <span className={classes.unit}>{u.label}</span>
        </div>
      ))}
    </>
  );
}
