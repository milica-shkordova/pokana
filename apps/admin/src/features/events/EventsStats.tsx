import Link from "next/link";
import type { EventStats } from "@pokanito/shared";
import { Stat } from "@pokanito/ui";

/** The four counters above the events table. */
export default function EventsStats({ stats }: { stats: EventStats | null }) {
  return (
    <div className="admin-stats">
      <Stat
        label="Live invitations"
        value={stats?.live ?? "–"}
        hint={stats ? (stats.liveThisWeek ? `${stats.liveThisWeek} happen this week` : "None this week") : undefined}
        hintTone="good"
      />
      <Stat label="Drafts & in review" value={stats?.draftsAndReview ?? "–"} hint="Not published yet" hintTone="warn" />
      <Stat label="RSVPs received" value={stats?.rsvps ?? "–"} hint="across live events" />
      <Stat
        label="New leads"
        value={stats?.newLeads ?? "–"}
        hint={
          <Link href="/leads" className="admin-link-strong">
            Open inbox →
          </Link>
        }
      />
    </div>
  );
}
