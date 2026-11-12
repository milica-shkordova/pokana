import { Card, EmptyState, buttonClassName, LoadState } from "@pokanito/ui";
import AdminLayout from "@/components/AdminLayout";
import LeadDetail from "@/features/leads/LeadDetail";
import LeadList from "@/features/leads/LeadList";
import { useLeads } from "@/features/leads/useLeads";

export default function LeadsPage() {
  const l = useLeads();
  const { leads, cur } = l;

  return (
    <AdminLayout
      kicker="From “Get in touch” & “Notify me”"
      title="Leads"
      actions={
        <a className={buttonClassName({ variant: "secondary" })} href="/api/admin/leads/export.csv" download>
          Export CSV
        </a>
      }
    >
      <LoadState loading={l.loading && !l.data} error={l.error} onRetry={l.reload}>
        {leads.length === 0 ? (
          <Card>
            <EmptyState icon="✉" title="No leads yet">
              Contact-form and “Notify me” submissions from the landing page arrive here.
            </EmptyState>
          </Card>
        ) : (
          <div className="admin-split">
            <LeadList leads={leads} currentId={cur?.id} onSelect={l.select} />

            {cur && (
              <LeadDetail
                key={cur.id}
                lead={cur}
                stageIdx={l.stageIdx}
                next={l.next}
                note={l.note}
                onNote={l.setNote}
                onStage={(stage) => void l.patch(cur, { stage })}
                onCreateEvent={() => l.createEvent(cur)}
                onDelete={() => void l.remove(cur)}
              />
            )}
          </div>
        )}
      </LoadState>
    </AdminLayout>
  );
}
