import { Button, LoadState, Tabs } from "@pokanito/ui";
import AdminLayout from "@/components/AdminLayout";
import NewTemplateDialog from "@/features/templates/NewTemplateDialog";
import TemplateGrid from "@/features/templates/TemplateGrid";
import TemplatePanel from "@/features/templates/TemplatePanel";
import { useTemplateLibrary } from "@/features/templates/useTemplateLibrary";

export default function TemplatesPage() {
  const lib = useTemplateLibrary();
  const { sel } = lib;

  return (
    <AdminLayout
      kicker="Library"
      title="Templates"
      actions={
        <Button iconLeft="+" onClick={lib.openCreate}>
          New template
        </Button>
      }
    >
      <LoadState loading={lib.loading && !lib.data} error={lib.error} onRetry={lib.reload}>
        <div className="admin-split">
          <div className="admin-split__main ui-stack">
            <Tabs variant="chips" items={lib.cats} value={lib.cat} onChange={lib.setCat} aria-label="Category" />
            <TemplateGrid items={lib.items} selectedId={sel?.id} onSelect={lib.select} />
          </div>

          {sel && <TemplatePanel key={sel.id} t={sel} onChange={lib.replace} onDeleted={lib.removeSelected} onOpenDefaults={lib.openDefaults} />}
        </div>
      </LoadState>

      <NewTemplateDialog
        open={lib.creating}
        templates={lib.list}
        initialBase={sel?.implemented ? sel.id : undefined}
        onClose={lib.closeCreate}
        onCreated={lib.created}
      />
    </AdminLayout>
  );
}
