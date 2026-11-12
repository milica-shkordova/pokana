import Link from "next/link";
import type { MediaItem } from "@pokanito/shared";
import { Badge, cx, IconMusic } from "@pokanito/ui";
import type { MediaGroup } from "./types";
import UploadDropZone from "./UploadDropZone";
import { fileLabel, focalStyle } from "./utils";

/** One event's files as a grid of selectable cards, plus a drop zone. */
export default function MediaGroupSection({
  group: g,
  selectedId,
  onSelect,
  onUploaded,
}: {
  group: MediaGroup;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onUploaded: (items: MediaItem[]) => void;
}) {
  return (
    <section className="ui-stack--8" aria-label={g.title}>
      <div className="ui-row ui-row--baseline">
        <h2 className="admin-group-title">{g.eventId ? <Link href={`/events/${g.eventId}`}>{g.title}</Link> : g.title}</h2>
        <span className="ui-muted">
          {g.items.length} file{g.items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="admin-media-grid">
        {g.items.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-label={m.fileName}
            aria-pressed={selectedId === m.id}
            className={cx("admin-media-card", selectedId === m.id && "admin-media-card--on")}
            onClick={() => onSelect(m.id)}
          >
            <span className={cx("admin-media-card__thumb", m.kind === "audio" && "admin-media-card__thumb--audio")}>
              {m.kind === "photo" ? <img src={m.thumbUrl} alt="" loading="lazy" style={focalStyle(m)} /> : <IconMusic />}
              {m.usedIn.length === 0 && (
                <Badge tone="review" size="sm" className="admin-media-card__badge">
                  Unused
                </Badge>
              )}
            </span>
            <span className="admin-media-card__name">{fileLabel(m)}</span>
          </button>
        ))}
        <UploadDropZone eventId={g.eventId} onUploaded={onUploaded} />
      </div>
    </section>
  );
}
