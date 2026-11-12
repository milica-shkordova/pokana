import { Card, EmptyState, LoadState } from "@pokanito/ui";
import AdminLayout from "@/components/AdminLayout";
import MediaDetail from "@/features/media/MediaDetail";
import MediaFilters from "@/features/media/MediaFilters";
import MediaGroupSection from "@/features/media/MediaGroupSection";
import MediaInUseDialog from "@/features/media/MediaInUseDialog";
import StorageMeter from "@/features/media/StorageMeter";
import { UploadButton } from "@/features/media/UploadButton";
import { useMediaLibrary } from "@/features/media/useMediaLibrary";

export default function MediaPage() {
  const m = useMediaLibrary();
  const { lib, sel } = m;

  return (
    <AdminLayout
      kicker="All photos & files"
      title="Media library"
      actions={
        <>
          {m.storage && <StorageMeter storage={m.storage} />}
          <UploadButton eventId={m.uploadEventId} kind="any" variant="primary" onUploaded={m.addItems} />
        </>
      }
    >
      <MediaFilters events={m.events} eventFilter={m.eventFilter} onEventFilter={m.setEventFilter} type={m.type} onType={m.setType} />

      <LoadState loading={lib.loading && !lib.data} error={lib.error} onRetry={lib.reload}>
        <div className="admin-split">
          <div className="admin-split__wide ui-stack--22">
            {m.groups.length === 0 && (
              <Card>
                <EmptyState icon="▦" title={m.items.length ? "Nothing matches" : "No files yet"}>
                  Upload photos (JPG, PNG, HEIC) or music (MP3).
                </EmptyState>
              </Card>
            )}
            {m.groups.map((g) => (
              <MediaGroupSection key={g.key} group={g} selectedId={sel?.id} onSelect={m.select} onUploaded={m.addItems} />
            ))}
          </div>

          {sel && <MediaDetail key={sel.id} item={sel} onChange={m.replaceItem} onDelete={() => void m.remove(sel)} />}
        </div>
      </LoadState>

      <MediaInUseDialog confirm={m.confirmDelete} onClose={m.closeConfirmDelete} onForce={(c) => void m.remove(c.item, true)} />
    </AdminLayout>
  );
}
