import { eventUrl, type TemplateSummary } from "@pokanito/shared";
import { Button, Dialog, buttonClassName } from "@pokanito/ui";
import { WEB_URL } from "@/lib/api";
import type { TemplatePanelState } from "./useTemplatePanel";

/** Use / Edit defaults / Open demo / Delete, plus the delete confirmation. */
export default function TemplatePanelActions({ t, panel }: { t: TemplateSummary; panel: TemplatePanelState }) {
  const { def, openingDefaults, openDefaults, confirmDelete, setConfirmDelete, deleteTemplate } = panel;
  return (
    <>
      <div className="admin-detail-actions">
        {def ? (
          <a href={`/events/new?template=${t.id}`} className={buttonClassName()}>
            Use for new event
          </a>
        ) : (
          <Button disabled>Use for new event</Button>
        )}
        <Button variant="secondary" disabled={!def} loading={openingDefaults} onClick={openDefaults}>
          Edit defaults
        </Button>
        {t.demoSlug ? (
          <a className={buttonClassName({ variant: "secondary" })} href={eventUrl(WEB_URL, t.demoSlug)} target="_blank" rel="noreferrer">
            Open demo ↗
          </a>
        ) : (
          <Button variant="secondary" disabled>
            Open demo ↗
          </Button>
        )}
        {t.isVariant && (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
            Delete template
          </Button>
        )}
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete “${t.name}”?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteTemplate}>
              Delete
            </Button>
          </>
        }
      >
        <p>Its defaults and demo are deleted too. Templates that events use can&apos;t be deleted. Set them to Hidden instead.</p>
      </Dialog>
    </>
  );
}
