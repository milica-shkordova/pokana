import { useRef, useState } from "react";
import { MEDIA_ACCEPT, type MediaItem, type MediaKind } from "@pokanito/shared";
import { Button, useToast, errorMessage, IconUpload } from "@pokanito/ui";
import { uploadFiles } from "@/lib/media";

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
  const accept = kind === "any" ? `${MEDIA_ACCEPT.photo},${MEDIA_ACCEPT.audio}` : MEDIA_ACCEPT[kind];
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
