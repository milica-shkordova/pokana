import { useState } from "react";
import { formatDuration, type MediaItem, type MediaKind } from "@pokanito/shared";
import { Dialog, EmptyState, Tabs, cx, IconMusic } from "@pokanito/ui";
import { UploadButton } from "./UploadButton";
import { fileLabel } from "./utils";

interface PickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
  kind: MediaKind;
  eventId: string;
  library: MediaItem[];
  onUploaded: (items: MediaItem[]) => void;
  title?: string;
}

/** Choose a file from the library (this event's files first) or upload a new one. */
export function MediaPicker({ open, onClose, onPick, kind, eventId, library, onUploaded, title }: PickerProps) {
  const [scope, setScope] = useState<"event" | "all">("event");
  const items = library.filter((m) => m.kind === kind && (scope === "all" || m.eventId === eventId));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={title ?? (kind === "photo" ? "Choose a photo" : "Choose music")}
      footer={
        <UploadButton
          eventId={eventId}
          kind={kind}
          multiple={false}
          variant="primary"
          label={kind === "photo" ? "Upload new photo" : "Upload MP3"}
          onUploaded={(up) => {
            onUploaded(up);
            if (up[0]) {
              onPick(up[0]);
              onClose();
            }
          }}
        />
      }
    >
      <Tabs
        variant="chips"
        items={[
          { value: "event", label: "This event" },
          { value: "all", label: "All files" },
        ]}
        value={scope}
        onChange={setScope}
        aria-label="Which files"
      />
      {items.length === 0 ? (
        <EmptyState icon={kind === "photo" ? "▦" : "♪"} title="Nothing here yet">
          Upload a file, or switch to “All files”.
        </EmptyState>
      ) : (
        <div className="admin-picker-grid">
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              className="admin-media-card"
              onClick={() => {
                onPick(m);
                onClose();
              }}
            >
              <span className={cx("admin-media-card__thumb", m.kind === "audio" && "admin-media-card__thumb--audio")}>
                {m.kind === "photo" ? <img src={m.thumbUrl} alt="" loading="lazy" /> : <IconMusic />}
              </span>
              <span className="admin-media-card__name">
                {fileLabel(m)}
                {m.durationSec ? ` · ${formatDuration(m.durationSec)}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </Dialog>
  );
}
