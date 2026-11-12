import { useRef, useState } from "react";
import { MEDIA_ACCEPT, type MediaItem } from "@pokanito/shared";
import { DropZone, useToast, IconPlus, errorMessage } from "@pokanito/ui";
import { uploadFiles } from "@/lib/media";

export default function UploadDropZone({ eventId, onUploaded }: { eventId: string | null; onUploaded: (items: MediaItem[]) => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      onUploaded(await uploadFiles(files, eventId));
      toast(files.length === 1 ? "Uploaded" : `${files.length} files uploaded`);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <input ref={input} type="file" hidden multiple accept={`${MEDIA_ACCEPT.photo},${MEDIA_ACCEPT.audio}`} onChange={(e) => void upload(e.target.files).then(() => (e.target.value = ""))} />
      <DropZone onClick={() => input.current?.click()} onFiles={(files) => void upload(files)} disabled={busy}>
        {busy ? "Uploading…" : <IconPlus size={20} />}
        {!busy && "Drop files here"}
      </DropZone>
    </>
  );
}
