import { Tabs, LoadState, IssueList, SearchInput } from "@pokanito/ui";
import AdminLayout from "@/components/AdminLayout";
import LeadBanners from "@/features/new-event/LeadBanners";
import NewEventHeader from "@/features/new-event/NewEventHeader";
import TemplatePickGrid from "@/features/new-event/TemplatePickGrid";
import TemplatePickPanel from "@/features/new-event/TemplatePickPanel";
import { useNewEvent } from "@/features/new-event/useNewEvent";

/**
 * New event, step 1 (Admin · New event: choose a template): filter and pick
 * a template; the panel on the right shows what it includes and creates the
 * draft. `?template=<id>` (Templates › Use for new event) and `?lead=<id>`
 * skip straight to creating.
 */
export default function NewEventPage() {
  const n = useNewEvent();
  const { templates, pick } = n;
  const create = (id: string) => void n.create(id);

  return (
    <AdminLayout title="New event" header={<NewEventHeader />}>
      <LoadState loading={!templates.data && !templates.error} error={templates.error} onRetry={templates.reload}>
        <div className="admin-new">
          <div className="admin-new__main">
            <div className="admin-new__filters">
              <Tabs variant="chips" items={n.cats} value={n.cat} onChange={n.setCat} aria-label="Category" />
              <SearchInput label="Search templates" className="admin-new__search" placeholder="Search templates" value={n.query} onChange={(e) => n.setQuery(e.target.value)} />
            </div>

            <LeadBanners lead={n.lead} suggestion={n.suggestion} />

            <IssueList error={n.error} />

            {n.shown.length === 0 ? (
              <p className="ui-muted">No templates match “{n.query}”.</p>
            ) : (
              <TemplatePickGrid templates={n.shown} pickedId={pick?.id} creating={n.creating} onSelect={n.select} onCreate={create} />
            )}
          </div>

          {pick && <TemplatePickPanel pick={pick} pickDef={n.pickDef} creating={n.creating} onCreate={create} />}
        </div>
      </LoadState>
    </AdminLayout>
  );
}
