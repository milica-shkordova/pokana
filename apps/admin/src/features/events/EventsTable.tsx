import type { EventSummary } from "@pokanito/shared";
import { Table, type MenuItem } from "@pokanito/ui";
import EventRow from "./EventRow";

export default function EventsTable({ events, menuFor }: { events: EventSummary[] | undefined; menuFor: (e: EventSummary) => MenuItem[] }) {
  return (
    <Table className="admin-events-table">
      <thead>
        <tr>
          <th>Event</th>
          <th>Template</th>
          <th>Event date</th>
          <th>Status</th>
          <th>Link</th>
          <th className="ui-num">RSVPs</th>
          <th>
            <span className="ui-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {events?.map((e) => (
          <EventRow key={e.id} event={e} menu={menuFor(e)} />
        ))}
      </tbody>
    </Table>
  );
}
