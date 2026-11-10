import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  CATEGORY_LABELS,
  TEMPLATE_CATEGORIES,
  type EventDetail,
  type EventStatus,
  type EventSummary,
  type TemplateCategory,
} from "@momentelo/shared";
import { Card, EmptyState, EventStatusBadge, Select, Stat, Table, Tabs, buttonClassName, useToast } from "@momentelo/ui";
import AdminLayout from "@/components/AdminLayout";
import LoadState from "@/components/LoadState";
import { Menu, type MenuItem } from "@/components/Menu";
import EventDialogs, { type EventAction } from "@/components/EventDialogs";
import {
  IconArchive,
  IconCopy,
  IconDownload,
  IconEdit,
  IconExternal,
  IconEye,
  IconLink,
  IconPause,
  IconPlus,
  IconQr,
  IconRestore,
  IconSearch,
  IconTrash,
} from "@/components/Icons";
import { api, copyText, errorMessage, useResource, WEB_HOST, WEB_URL } from "@/lib/api";
import { formatDate, toneFor } from "@/lib/format";
import { useSession } from "@/lib/session";

type Tab = "all" | Extract<EventStatus, "live" | "draft" | "in-review" | "past" | "archived">;
const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "in-review", label: "In review" },
  { value: "past", label: "Past" },
  { value: "archived", label: "Archived" },
];

/** QR code PNG for an invitation link, downloaded right away. */
async function downloadQr(e: EventSummary) {
  const QRCode = (await import("qrcode")).default;
  const url = await QRCode.toDataURL(`${WEB_URL}/${e.slug}`, {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#2A2522", light: "#FFFFFF" },
  });
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.slug}-qr.png`;
  a.click();
}

/** Guest list as CSV (the API sends it as a download). */
function exportGuests(e: EventSummary) {
  const a = document.createElement("a");
  a.href = `/api/admin/events/${e.id}/rsvps.csv`;
  a.download = `${e.slug}-guests.csv`;
  a.click();
}

type Sort = "eventDate" | "updated" | "name";

export default function EventsPage() {
  const router = useRouter();
  const toast = useToast();
  const { stats, refreshStats } = useSession();
  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState<TemplateCategory | "">("");
  const [sort, setSort] = useState<Sort>("eventDate");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Everything (archived too) in one request: the tabs filter here, so each
  // tab can show its count.
  const path = useMemo(() => {
    const p = new URLSearchParams({ sort, archived: "include" });
    if (category) p.set("category", category);
    if (debounced) p.set("q", debounced);
    return `/api/admin/events?${p}`;
  }, [category, sort, debounced]);
  const { data: all, loading, error, reload } = useResource<EventSummary[]>(path);
  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: 0, live: 0, draft: 0, "in-review": 0, past: 0, archived: 0 };
    for (const e of all ?? []) {
      if (e.status in c) c[e.status as Tab]++;
      if (e.status !== "archived") c.all++;
    }
    return c;
  }, [all]);
  const data = useMemo(
    () => all?.filter((e) => (tab === "all" ? e.status !== "archived" : e.status === tab)),
    [all, tab],
  );
  const tabItems = TABS.map((t) => ({ ...t, count: counts[t.value] }));
  const [confirm, setConfirm] = useState<EventAction>(null);

  const act = async (fn: () => Promise<unknown>, done: string) => {
    try {
      await fn();
      toast(done);
      void reload();
      refreshStats();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  const copyPreview = (e: EventSummary, open: boolean) =>
    void api
      .post<{ url: string }>(`/api/admin/events/${e.id}/preview-link`)
      .then(async ({ url }) => {
        if (open) window.open(url, "_blank", "noopener");
        else {
          const ok = await copyText(url);
          toast(ok ? "Preview link copied" : "Couldn't copy", ok ? "default" : "error");
        }
      })
      .catch((err) => toast(errorMessage(err), "error"));

  /** The row menu, by status (live/past · draft/in review · archived). */
  const menuFor = (e: EventSummary): MenuItem[] => {
    const open: MenuItem = { label: "Open editor", icon: <IconEdit />, onSelect: () => void router.push(`/events/${e.id}`) };
    const duplicate: MenuItem = {
      label: "Duplicate",
      icon: <IconCopy />,
      onSelect: () =>
        void act(async () => {
          const copy = await api.post<EventDetail>(`/api/admin/events/${e.id}/duplicate`);
          await router.push(`/events/${copy.id}`);
        }, "Duplicated"),
    };
    const guests: MenuItem = { label: "Export guest list", icon: <IconDownload />, hint: "CSV", onSelect: () => exportGuests(e) };
    const archive: MenuItem = {
      label: "Archive",
      icon: <IconArchive />,
      danger: true,
      divider: true,
      onSelect: () => setConfirm({ kind: "archive", event: e }),
    };

    if (e.status === "archived") {
      return [
        open,
        {
          label: "Restore",
          icon: <IconRestore />,
          onSelect: () => void act(() => api.post(`/api/admin/events/${e.id}/restore`), `“${e.name}” restored`),
        },
        ...(e.rsvpCount > 0 ? [guests] : []),
        {
          label: "Delete permanently",
          icon: <IconTrash />,
          danger: true,
          divider: true,
          onSelect: () => setConfirm({ kind: "delete", event: e }),
        },
      ];
    }
    if (e.status === "live" || e.status === "past") {
      return [
        open,
        { label: "View live page", icon: <IconExternal />, onSelect: () => void window.open(`${WEB_URL}/${e.slug}`, "_blank", "noopener") },
        {
          label: "Copy link",
          icon: <IconLink />,
          onSelect: () =>
            void copyText(`${WEB_URL}/${e.slug}`).then((ok) => toast(ok ? "Link copied" : "Couldn't copy", ok ? "default" : "error")),
        },
        {
          label: "Download QR code",
          icon: <IconQr />,
          hint: "PNG",
          onSelect: () => void downloadQr(e).catch(() => toast("Couldn't make the QR code", "error")),
        },
        guests,
        duplicate,
        ...(e.status === "live"
          ? [{ label: "Unpublish", icon: <IconPause />, onSelect: () => setConfirm({ kind: "unpublish", event: e }) }]
          : []),
        archive,
      ];
    }
    // Draft / in review.
    return [
      open,
      { label: "Preview", icon: <IconEye />, onSelect: () => copyPreview(e, true) },
      { label: "Copy preview link", icon: <IconLink />, hint: "for the client", onSelect: () => copyPreview(e, false) },
      duplicate,
      archive,
      ...(e.status === "draft"
        ? [{ label: "Delete draft", icon: <IconTrash />, danger: true, onSelect: () => setConfirm({ kind: "delete", event: e }) }]
        : []),
    ];
  };

  return (
    <AdminLayout
      kicker="Workspace"
      title="Events"
      actions={
        <>
          <label className="admin-search">
            <IconSearch />
            <span className="ui-sr-only">Search events</span>
            <input type="search" placeholder="Search by name, client or link" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <Link href="/events/new" className={buttonClassName({}, "admin-btn-icon")}>
            <IconPlus />
            New event
          </Link>
        </>
      }
    >
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

      <Card padding="none">
        <div className="admin-table-toolbar">
          <Tabs sliding items={tabItems} value={tab} onChange={setTab} aria-label="Filter events" />
          <div className="admin-row">
            {tab === "all" && counts.archived > 0 && <span className="admin-muted admin-table-hint">Archived events are hidden here</span>}
            <label>
              <span className="ui-sr-only">Event type</span>
              <Select className="admin-select-sm" value={category} onChange={(e) => setCategory(e.target.value as TemplateCategory | "")}>
                <option value="">All event types</option>
                {TEMPLATE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c].many}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              <span className="ui-sr-only">Sort</span>
              <Select className="admin-select-sm" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="eventDate">Sort: event date</option>
                <option value="updated">Sort: last edited</option>
                <option value="name">Sort: name</option>
              </Select>
            </label>
          </div>
        </div>
        <LoadState loading={loading && !data} error={error} onRetry={reload}>
          {data && data.length === 0 ? (
            <EmptyState
              title={
                tab === "archived" && !debounced && !category
                  ? "Nothing archived"
                  : debounced || tab !== "all" || category
                    ? "Nothing matches"
                    : "No events yet"
              }
              action={
                <Link href="/events/new" className={buttonClassName()}>
                  Create the first one
                </Link>
              }
            />
          ) : (
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
                {data?.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="admin-event-cell">
                        {e.thumbUrl ? (
                          <img className="admin-thumb" src={e.thumbUrl} alt="" />
                        ) : (
                          <span className="admin-thumb admin-thumb--initial" style={{ background: toneFor(e.id) }} aria-hidden>
                            {e.name.charAt(0)}
                          </span>
                        )}
                        <div className="admin-event-cell__text">
                          <Link href={`/events/${e.id}`} className="admin-event-cell__name">
                            {e.name}
                          </Link>
                          <span className="admin-muted">{e.clientName || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {e.templateName}
                      <div className="admin-muted">{e.category ? CATEGORY_LABELS[e.category].one : ""}</div>
                    </td>
                    <td>{formatDate(e.eventDate)}</td>
                    <td>
                      <EventStatusBadge status={e.status} />
                      {e.status === "archived" && e.archivedOnline && <div className="admin-muted admin-small">Link still online</div>}
                    </td>
                    <td>
                      <a className="admin-link-muted" href={`${WEB_URL}/${e.slug}`} target="_blank" rel="noreferrer">
                        {WEB_HOST}/{e.slug}
                      </a>
                    </td>
                    <td className="ui-num">
                      {e.rsvpCount === 0 && !e.expectedGuests
                        ? "—"
                        : e.expectedGuests
                          ? `${e.attendingGuests} / ${e.expectedGuests}`
                          : e.attendingGuests}
                    </td>
                    <td className="ui-num">
                      <Menu label={`Actions for ${e.name}`} items={menuFor(e)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </LoadState>
      </Card>

      <EventDialogs
        action={confirm}
        onClose={() => setConfirm(null)}
        onUnpublish={(e) => act(() => api.post(`/api/admin/events/${e.id}/unpublish`), `“${e.name}” is back in Draft`)}
        onArchive={(e, keepOnline) => act(() => api.post(`/api/admin/events/${e.id}/archive`, { keepOnline }), `“${e.name}” archived`)}
        onDelete={(e) => act(() => api.delete(`/api/admin/events/${e.id}`), `“${e.name}” deleted`)}
      />
    </AdminLayout>
  );
}
