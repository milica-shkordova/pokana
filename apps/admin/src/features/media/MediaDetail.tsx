import Link from "next/link";
import { MEDIA_ACCEPT, type MediaItem } from "@pokanito/shared";
import { Button, Card, Field, Input, IconMusic } from "@pokanito/ui";
import { useMediaDetail } from "./useMediaDetail";
import { fileLabel, mediaMeta, prettySlot } from "./utils";

export default function MediaDetail({ item, onChange, onDelete }: { item: MediaItem; onChange: (m: MediaItem) => void; onDelete: () => void }) {
  const { focal, frame, focalHandlers, onFocalKeyDown, alt, setAlt, saveAlt, replaceInput, replacing, replace } = useMediaDetail(item, onChange);

  const isPhoto = item.kind === "photo";
  const meta = mediaMeta(item);

  return (
    <Card className="admin-split__side ui-stack admin-panel-in" aria-label="File details">
      {isPhoto ? (
        <>
          <div ref={frame} className="admin-focal" {...focalHandlers}>
            <img src={item.url} alt={item.alt} draggable={false} />
            <span
              role="slider"
              tabIndex={0}
              aria-label="Focus point (use arrow keys to move)"
              aria-valuetext={`${Math.round(focal.x * 100)}% across, ${Math.round(focal.y * 100)}% down`}
              aria-valuenow={Math.round(focal.x * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="admin-focal__dot"
              style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
              onKeyDown={onFocalKeyDown}
            />
          </div>
          <span className="ui-muted">Drag the dot to set the focus point, so the face stays in frame on every screen size.</span>
        </>
      ) : (
        <div className="admin-audio-preview">
          <IconMusic size={40} />
          <audio controls preload="none" src={item.url} />
        </div>
      )}

      <div className="ui-stack--4">
        <strong className="ui-break">{fileLabel(item)}</strong>
        <span className="ui-muted">{meta}</span>
      </div>

      <div className="ui-stack--4">
        <span className="ui-label">Used in</span>
        <span className="admin-usedin">
          {item.usedIn.length === 0
            ? "Not used yet"
            : item.usedIn.map((u, i) => (
                <span key={`${u.eventId}-${u.slot}`}>
                  {i > 0 && ", "}
                  <Link href={`/events/${u.eventId}`}>{u.eventName}</Link> · {prettySlot(u.slot)}
                </span>
              ))}
        </span>
      </div>

      {isPhoto && (
        <Field label="Description (for screen readers)">
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} onBlur={saveAlt} />
        </Field>
      )}

      <div className="admin-detail-actions">
        <input ref={replaceInput} type="file" hidden accept={isPhoto ? MEDIA_ACCEPT.photo : MEDIA_ACCEPT.audio} onChange={replace} />
        <Button variant="secondary" loading={replacing} onClick={() => replaceInput.current?.click()}>
          Replace
        </Button>
        <a className="ui-button ui-button--secondary" href={item.originalUrl} download>
          Download original
        </a>
        <Button variant="danger" block onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
