import type { EventSummary } from "@pokanito/shared";
import { Select, Tabs } from "@pokanito/ui";
import { TYPE_TABS } from "./constants";
import type { TypeTab } from "./types";

export default function MediaFilters({
  events,
  eventFilter,
  onEventFilter,
  type,
  onType,
}: {
  events: EventSummary[] | undefined;
  eventFilter: string;
  onEventFilter: (v: string) => void;
  type: TypeTab;
  onType: (v: TypeTab) => void;
}) {
  return (
    <div className="ui-row ui-row--wrap">
      <label>
        <span className="ui-sr-only">Event</span>
        <Select size="sm" value={eventFilter} onChange={(e) => onEventFilter(e.target.value)}>
          <option value="">All events</option>
          {events?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
              {e.isDemo ? " (demo)" : ""}
            </option>
          ))}
          <option value="shared">Shared: template defaults</option>
        </Select>
      </label>
      <Tabs variant="chips" items={TYPE_TABS} value={type} onChange={onType} aria-label="File type" />
      <span className="ui-muted ui-push">Photos are compressed for phones automatically. Originals are kept.</span>
    </div>
  );
}
