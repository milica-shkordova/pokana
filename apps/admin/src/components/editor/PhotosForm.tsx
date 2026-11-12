import { useRef, useState } from "react";
import { MEDIA_ACCEPT } from "@pokanito/shared";
import { Button, useToast, errorMessage, IconUpload } from "@pokanito/ui";
import { UploadButton, uploadFiles } from "../MediaPicker";
import { EditorCard } from "./fields";
import type { FormProps } from "./context";

/** One tile per template photo slot (Hero 4:5, Mid-page 16:9 …). */
export default function PhotosForm({ event, def, updateContent, mediaById, pick, addToLibrary, library }: FormProps) {
  const toast = useToast();
  const photos = event.content.photos ?? {};
  const setSlot = (slot: string, id: string | null) => updateContent((c) => ({ ...c, photos: { ...c.photos, [slot]: id } }));
  const unassigned = library.filter((m) => m.eventId === event.id && m.kind === "photo" && !Object.values(photos).includes(m.id));

  return (
    <EditorCard title="Photos" aside="Each slot maps to a spot in the template · focal points are set in the Media library">
      <div className="admin-photo-grid">
        {def.photoSlots.map((slot) => (
          <SlotTile
            key={slot.id}
            label={slot.label}
            aspect={slot.aspect}
            required={slot.required}
            media={mediaById(photos[slot.id])}
            onUpload={async (file) => {
              try {
                const [m] = await uploadFiles([file], event.id);
                addToLibrary([m]);
                setSlot(slot.id, m.id);
              } catch (err) {
                toast(errorMessage(err), "error");
              }
            }}
            onChoose={() => pick("photo", (m) => setSlot(slot.id, m.id), `Photo for “${slot.label}”`)}
            onRemove={() => setSlot(slot.id, null)}
          />
        ))}
      </div>
      {unassigned.length > 0 && (
        <p className="ui-muted">
          {unassigned.length} uploaded photo{unassigned.length === 1 ? " isn't" : "s aren't"} in a slot yet — use “Choose” on a slot.
        </p>
      )}
      <div>
        <UploadButton eventId={event.id} label="Upload photos to this event" onUploaded={addToLibrary} />
      </div>
    </EditorCard>
  );
}

function SlotTile({
  label,
  aspect,
  required,
  media,
  onUpload,
  onChoose,
  onRemove,
}: {
  label: string;
  aspect: string;
  required: boolean;
  media?: { thumbUrl: string; alt: string; fileName: string; focalX: number; focalY: number };
  onUpload: (file: File) => Promise<void>;
  onChoose: () => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  // Tiles are uniform (design); the slot's real crop is in the caption.
  return (
    <figure className="admin-photo">
      <div
        className="admin-photo__frame"
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (!f) return;
          setBusy(true);
          await onUpload(f);
          setBusy(false);
        }}
      >
        {media ? (
          <img src={media.thumbUrl} alt={media.alt} style={{ objectPosition: `${media.focalX * 100}% ${media.focalY * 100}%` }} />
        ) : (
          <button type="button" className="admin-photo__empty" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : <IconUpload size={22} />}
            {!busy && <span>Upload</span>}
            <span className="admin-photo__formats">JPG · PNG · HEIC</span>
          </button>
        )}
      </div>
      <figcaption>
        <b>{label}</b> · {aspect}
        {required && !media && <span className="ui-warn"> · required</span>}
        {media && <span className="ui-muted"> · {media.fileName.replace(/^seed:/, "")}</span>}
      </figcaption>
      <div className="ui-row">
        <input
          ref={input}
          type="file"
          hidden
          accept={MEDIA_ACCEPT.photo}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            await onUpload(f);
            setBusy(false);
            e.target.value = "";
          }}
        />
        <Button size="sm" variant="secondary" onClick={onChoose}>
          Choose
        </Button>
        {media && (
          <>
            <Button size="sm" variant="ghost" onClick={() => input.current?.click()} loading={busy}>
              Replace
            </Button>
            <Button size="sm" variant="danger" onClick={onRemove}>
              Remove
            </Button>
          </>
        )}
      </div>
    </figure>
  );
}
