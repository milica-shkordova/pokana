import { useRef, useState } from "react";
import type { MediaItem, MediaKind } from "@pokanito/shared";
import { Button, Dialog, EmptyState, Tabs, cx, useToast } from "@pokanito/ui";
import { api, errorMessage } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { IconMusic, IconUpload } from "./Icons";

export const ACCEPT: Record<MediaKind, string> = {
  photo: "image/jpeg,image/png,image/heic,image/heif,image/webp,.heic,.heif,.jpg,.jpeg,.png",
  audio: "audio/mpeg,.mp3",
};

export async function uploadFiles(files: FileList | File[], eventId: string | null): Promise<MediaItem[]> {
  const form = new FormData();
  for (const f of Array.from(files)) form.append("file", f);
  if (eventId) form.append("eventId", eventId);
  return api.upload<MediaItem[]>("/api/admin/media", form);
}

/** Hidden file input + button that uploads and reports the new items. */
export function UploadButton({
  eventId,
  kind = "photo",
  multiple = true,
  onUploaded,
  label = "Upload",
  variant = "secondary",
  size = "md",
}: {
  eventId: string | null;
  kind?: MediaKind | "any";
  multiple?: boolean;
  onUploaded: (items: MediaItem[]) => void;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const accept = kind === "any" ? `${ACCEPT.photo},${ACCEPT.audio}` : ACCEPT[kind];
  return (
    <>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={async (e) => {
          const files = e.target.files;
          if (!files?.length) return;
          setBusy(true);
          try {
            const items = await uploadFiles(files, eventId);
            onUploaded(items);
            toast(items.length === 1 ? "Uploaded" : `${items.length} files uploaded`);
          } catch (err) {
            toast(errorMessage(err), "error");
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      <Button variant={variant} size={size} loading={busy} iconLeft={<IconUpload />} onClick={() => input.current?.click()}>
        {label}
      </Button>
    </>
  );
}

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
                {m.fileName.replace(/^seed:/, "")}
                {m.durationSec ? ` · ${formatDuration(m.durationSec)}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </Dialog>
  );
}
