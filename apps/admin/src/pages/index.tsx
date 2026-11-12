import Link from "next/link";
import { Card, EmptyState, buttonClassName, LoadState, IconPlus, SearchInput } from "@pokanito/ui";
import AdminLayout from "@/components/AdminLayout";
import EventDialogs from "@/features/events/EventDialogs";
import EventsStats from "@/features/events/EventsStats";
import EventsTable from "@/features/events/EventsTable";
import EventsToolbar from "@/features/events/EventsToolbar";
import { useEventRowActions } from "@/features/events/useEventRowActions";
import { useEventsList } from "@/features/events/useEventsList";
import { emptyTitle } from "@/features/events/utils";
import { useSession } from "@/lib/session";

export default function EventsPage() {
  const { stats } = useSession();
  const list = useEventsList();
  const { data, tab, category, debounced } = list;
  const actions = useEventRowActions(list.reload);

  return (
    <AdminLayout
      kicker="Workspace"
      title="Events"
      actions={
        <>
          <SearchInput label="Search events" placeholder="Search by name, client or link" value={list.query} onChange={(e) => list.setQuery(e.target.value)} />
          <Link href="/events/new" className={buttonClassName({}, "admin-btn-icon")}>
            <IconPlus />
            New event
          </Link>
        </>
      }
    >
      <EventsStats stats={stats} />

      <Card padding="none">
        <EventsToolbar
          tabItems={list.tabItems}
          tab={tab}
          onTab={list.setTab}
          archivedCount={list.counts.archived}
          category={category}
          onCategory={list.setCategory}
          sort={list.sort}
          onSort={list.setSort}
        />
        <LoadState loading={list.loading && !data} error={list.error} onRetry={list.reload}>
          {data && data.length === 0 ? (
            <EmptyState
              title={emptyTitle(tab, debounced, category)}
              action={
                <Link href="/events/new" className={buttonClassName()}>
                  Create the first one
                </Link>
              }
            />
          ) : (
            <EventsTable events={data} menuFor={actions.menuFor} />
          )}
        </LoadState>
      </Card>

      <EventDialogs
        action={actions.confirm}
        onClose={actions.closeConfirm}
        onUnpublish={actions.unpublish}
        onArchive={actions.archive}
        onDelete={actions.remove}
      />
    </AdminLayout>
  );
}
