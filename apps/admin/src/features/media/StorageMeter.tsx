import { formatBytes, type MediaLibrary } from "@pokanito/shared";
import { Progress } from "@pokanito/ui";

export default function StorageMeter({ storage }: { storage: MediaLibrary["storage"] }) {
  return (
    <div className="admin-storage">
      <span className="ui-muted">
        Storage: <b className="ui-ink">{formatBytes(storage.usedBytes)}</b> of {formatBytes(storage.quotaBytes)}
      </span>
      <Progress value={(storage.usedBytes / storage.quotaBytes) * 100} label="Storage used" />
    </div>
  );
}
