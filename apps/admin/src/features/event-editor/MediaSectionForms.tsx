import { formatDuration, moveItem } from "@pokanito/shared";
import { Button, FormGrid, IconMusic } from "@pokanito/ui";
import { UploadButton } from "@/features/media/UploadButton";
import { fileLabel } from "@/features/media/utils";
import { EditorCard, LocalizedField, RowControls } from "./fields";
import { setContent, type SectionFormProps } from "./context";

export function GalleryForm({ event, languages, updateContent, label, mediaById, pick, addToLibrary }: SectionFormProps) {
  const g = event.content.gallery ?? { photos: [] };
  const set = (photos: string[]) => setContent(updateContent, "gallery")({ ...g, photos });
  return (
    <EditorCard
      title={label}
      aside={
        <div className="ui-row">
          <UploadButton
            eventId={event.id}
            size="sm"
            onUploaded={(items) => {
              addToLibrary(items);
              set([...g.photos, ...items.filter((m) => m.kind === "photo").map((m) => m.id)]);
            }}
          />
          <Button size="sm" variant="secondary" onClick={() => pick("photo", (m) => set([...g.photos, m.id]), "Add to gallery")}>
            Choose from library
          </Button>
        </div>
      }
    >
      <FormGrid>
        <LocalizedField label="Heading" value={g.heading} languages={languages} onChange={(v) => setContent(updateContent, "gallery")({ ...g, heading: v })} />
      </FormGrid>
      <div className="admin-photo-grid">
        {g.photos.map((id, i) => {
          const m = mediaById(id);
          return (
            <figure key={`${id}-${i}`} className="admin-photo">
              <div className="admin-photo__frame" style={{ aspectRatio: "1" }}>
                {m ? <img src={m.thumbUrl} alt={m.alt} /> : <span className="ui-muted">Missing file</span>}
              </div>
              <RowControls index={i} count={g.photos.length} label={`photo ${i + 1}`} onMove={(a, b) => set(moveItem(g.photos, a, b))} onRemove={() => set(g.photos.filter((_, j) => j !== i))} />
            </figure>
          );
        })}
      </div>
      {g.photos.length === 0 && <p className="ui-muted">No gallery photos yet.</p>}
    </EditorCard>
  );
}

export function MusicForm({ event, updateContent, label, mediaById, pick, addToLibrary }: SectionFormProps) {
  const music = event.content.music ?? {};
  const track = mediaById(music.mediaId);
  const set = setContent(updateContent, "music");
  return (
    <EditorCard title={label} aside="Plays after the guest taps play (browsers block autoplay with sound)">
      {track ? (
        <div className="admin-music">
          <span className="admin-music__icon">
            <IconMusic size={22} />
          </span>
          <div className="ui-stack--8" style={{ flex: 1, minWidth: 0 }}>
            <strong>{fileLabel(track)}</strong>
            <span className="ui-muted">{formatDuration(track.durationSec)}</span>
            <audio controls preload="none" src={track.url} style={{ width: "100%" }} />
          </div>
          <Button size="sm" variant="ghost" onClick={() => set({ ...music, mediaId: null })}>
            Remove
          </Button>
        </div>
      ) : (
        <p className="ui-muted">No music chosen.</p>
      )}
      <div className="ui-row">
        <UploadButton
          eventId={event.id}
          kind="audio"
          multiple={false}
          label="Upload MP3"
          onUploaded={(items) => {
            addToLibrary(items);
            if (items[0]) set({ ...music, mediaId: items[0].id });
          }}
        />
        <Button variant="secondary" onClick={() => pick("audio", (m) => set({ ...music, mediaId: m.id }))}>
          Choose from library
        </Button>
      </div>
    </EditorCard>
  );
}
