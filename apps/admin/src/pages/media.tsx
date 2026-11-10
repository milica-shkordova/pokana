import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ApiError, type EventSummary, type MediaItem, type MediaLibrary } from "@momentelo/shared";
import { Badge, Button, Card, Dialog, EmptyState, Field, Input, Progress, Select, Tabs, cx, useToast } from "@momentelo/ui";
import AdminLayout from "@/components/AdminLayout";
import LoadState from "@/components/LoadState";
import { ACCEPT, UploadButton, uploadFiles } from "@/components/MediaPicker";
import { IconMusic, IconPlus } from "@/components/Icons";
import { api, errorMessage, useResource } from "@/lib/api";
import { formatBytes, formatDuration } from "@/lib/format";

type TypeTab = "all" | "photo" | "audio" | "unused";

export default function MediaPage() {
  const toast = useToast();
  const lib = useResource<MediaLibrary>("/api/admin/media");
  const events = useResource<EventSummary[]>("/api/admin/events?demo=1&sort=name");
  const [eventFilter, setEventFilter] = useState<string>("");
  const [type, setType] = useState<TypeTab>("all");
  const [selId, setSelId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ item: MediaItem; message: string } | null>(null);

  const items = useMemo(() => lib.data?.items ?? [], [lib.data]);
  const filtered = items.filter(
    (m) =>
      (!eventFilter || (eventFilter === "shared" ? !m.eventId : m.eventId === eventFilter)) &&
      (type === "all" || (type === "unused" ? m.usedIn.length === 0 : m.kind === type)),
  );
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; eventId: string | null; title: string; items: MediaItem[] }>();
    for (const m of filtered) {
      const key = m.eventId ?? "shared";
      if (!map.has(key)) map.set(key, { key, eventId: m.eventId, title: m.eventName ?? "Shared: template defaults", items: [] });
      map.get(key)!.items.push(m);
    }
    return [...map.values()];
  }, [filtered]);
  const sel = items.find((m) => m.id === selId) ?? filtered[0];

  const replaceItem = (m: MediaItem) => lib.mutate((prev) => ({ storage: prev!.storage, items: prev!.items.map((x) => (x.id === m.id ? m : x)) }));
  const addItems = (list: MediaItem[]) => {
    lib.mutate((prev) => ({ storage: prev?.storage ?? { usedBytes: 0, quotaBytes: 1 }, items: [...list, ...(prev?.items ?? [])] }));
    if (list[0]) setSelId(list[0].id);
    void lib.reload();
  };

  const remove = async (m: MediaItem, force = false) => {
    try {
      await api.delete(`/api/admin/media/${m.id}${force ? "?force=1" : ""}`);
      lib.mutate((prev) => ({ storage: prev!.storage, items: prev!.items.filter((x) => x.id !== m.id) }));
      setConfirmDelete(null);
      setSelId(null);
      toast("Deleted");
      void lib.reload();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setConfirmDelete({ item: m, message: err.message });
      else toast(errorMessage(err), "error");
    }
  };

  const storage = lib.data?.storage;
  const typeTabs: { value: TypeTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "photo", label: "Photos" },
    { value: "audio", label: "Music" },
    { value: "unused", label: "Unused" },
  ];

  return (
    <AdminLayout
      kicker="All photos & files"
      title="Media library"
      actions={
        <>
          {storage && (
            <div className="admin-storage">
              <span className="admin-muted">
                Storage: <b className="admin-ink">{formatBytes(storage.usedBytes)}</b> of {formatBytes(storage.quotaBytes)}
              </span>
              <Progress value={(storage.usedBytes / storage.quotaBytes) * 100} label="Storage used" />
            </div>
          )}
          <UploadButton
            eventId={eventFilter && eventFilter !== "shared" ? eventFilter : null}
            kind="any"
            variant="primary"
            onUploaded={addItems}
          />
        </>
      }
    >
      <div className="admin-row admin-row--wrap">
        <label>
          <span className="ui-sr-only">Event</span>
          <Select className="admin-select-sm" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="">All events</option>
            {events.data?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
                {e.isDemo ? " (demo)" : ""}
              </option>
            ))}
            <option value="shared">Shared: template defaults</option>
          </Select>
        </label>
        <Tabs variant="chips" items={typeTabs} value={type} onChange={setType} aria-label="File type" />
        <span className="admin-muted admin-push">Photos are compressed for phones automatically. Originals are kept.</span>
      </div>

      <LoadState loading={lib.loading && !lib.data} error={lib.error} onRetry={lib.reload}>
        <div className="admin-split">
          <div className="admin-split__wide admin-stack-lg">
            {groups.length === 0 && (
              <Card>
                <EmptyState icon="▦" title={items.length ? "Nothing matches" : "No files yet"}>
                  Upload photos (JPG, PNG, HEIC) or music (MP3).
                </EmptyState>
              </Card>
            )}
            {groups.map((g) => (
              <section key={g.key} className="admin-stack-sm" aria-label={g.title}>
                <div className="admin-row admin-row--baseline">
                  <h2 className="admin-group-title">{g.eventId ? <Link href={`/events/${g.eventId}`}>{g.title}</Link> : g.title}</h2>
                  <span className="admin-muted">
                    {g.items.length} file{g.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="admin-media-grid">
                  {g.items.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-label={m.fileName}
                      aria-pressed={sel?.id === m.id}
                      className={cx("admin-media-card", sel?.id === m.id && "admin-media-card--on")}
                      onClick={() => setSelId(m.id)}
                    >
                      <span className={cx("admin-media-card__thumb", m.kind === "audio" && "admin-media-card__thumb--audio")}>
                        {m.kind === "photo" ? <img src={m.thumbUrl} alt="" loading="lazy" style={{ objectPosition: `${m.focalX * 100}% ${m.focalY * 100}%` }} /> : <IconMusic />}
                        {m.usedIn.length === 0 && (
                          <Badge tone="review" size="sm" className="admin-media-card__badge">
                            Unused
                          </Badge>
                        )}
                      </span>
                      <span className="admin-media-card__name">{m.fileName.replace(/^seed:/, "")}</span>
                    </button>
                  ))}
                  <DropZone eventId={g.eventId} onUploaded={addItems} />
                </div>
              </section>
            ))}
          </div>

          {sel && <MediaDetail key={sel.id} item={sel} onChange={replaceItem} onDelete={() => void remove(sel)} />}
        </div>
      </LoadState>

      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="This file is in use"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={() => confirmDelete && void remove(confirmDelete.item, true)}>
              Delete anyway
            </Button>
          </>
        }
      >
        <p>
          {confirmDelete?.message}. Deleting it leaves an empty spot on {confirmDelete && confirmDelete.item.usedIn.length > 1 ? "those invitations" : "that invitation"}.
        </p>
      </Dialog>
    </AdminLayout>
  );
}

function DropZone({ eventId, onUploaded }: { eventId: string | null; onUploaded: (items: MediaItem[]) => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      onUploaded(await uploadFiles(files, eventId));
      toast(files.length === 1 ? "Uploaded" : `${files.length} files uploaded`);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <input ref={input} type="file" hidden multiple accept={`${ACCEPT.photo},${ACCEPT.audio}`} onChange={(e) => void upload(e.target.files).then(() => (e.target.value = ""))} />
      <button
        type="button"
        className={cx("admin-dropzone", over && "admin-dropzone--over")}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void upload(e.dataTransfer.files);
        }}
        disabled={busy}
      >
        {busy ? "Uploading…" : <IconPlus size={20} />}
        {!busy && "Drop files here"}
      </button>
    </>
  );
}

function MediaDetail({ item, onChange, onDelete }: { item: MediaItem; onChange: (m: MediaItem) => void; onDelete: () => void }) {
  const toast = useToast();
  const [focal, setFocal] = useState({ x: item.focalX, y: item.focalY });
  const [alt, setAlt] = useState(item.alt);
  const [replacing, setReplacing] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const replaceInput = useRef<HTMLInputElement>(null);

  const save = async (body: Partial<Pick<MediaItem, "alt" | "focalX" | "focalY">>) => {
    try {
      onChange(await api.patch<MediaItem>(`/api/admin/media/${item.id}`, body));
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  // Persist focal point changes after the user stops moving it.
  useEffect(() => {
    if (focal.x === item.focalX && focal.y === item.focalY) return;
    const t = setTimeout(() => void save({ focalX: focal.x, focalY: focal.y }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focal]);

  const fromPointer = (e: React.PointerEvent) => {
    const r = frame.current!.getBoundingClientRect();
    const clamp = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 1000) / 1000;
    setFocal({ x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) });
  };

  const isPhoto = item.kind === "photo";
  const meta = isPhoto
    ? `${item.mime.split("/")[1].toUpperCase().replace("JPEG", "JPG")}${item.mime.includes("heic") ? " → JPG" : ""} · ${item.width}×${item.height} · ${formatBytes(item.bytes)}${item.optimizedBytes ? ` → ${formatBytes(item.optimizedBytes)} on phones` : ""}`
    : `MP3 · ${formatDuration(item.durationSec)} · ${formatBytes(item.bytes)}`;

  return (
    <Card className="admin-split__side admin-stack admin-panel-in" aria-label="File details">
      {isPhoto ? (
        <>
          <div
            ref={frame}
            className="admin-focal"
            onPointerDown={(e) => {
              dragging.current = true;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              fromPointer(e);
            }}
            onPointerMove={(e) => dragging.current && fromPointer(e)}
            onPointerUp={() => (dragging.current = false)}
          >
            <img src={item.url} alt={item.alt} draggable={false} />
            <span
              role="slider"
              tabIndex={0}
              aria-label="Focus point (use arrow keys to move)"
              aria-valuetext={`${Math.round(focal.x * 100)}% across, ${Math.round(focal.y * 100)}% down`}
              aria-valuenow={Math.round(focal.x * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="admin-focal__dot"
              style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
              onKeyDown={(e) => {
                const step = e.shiftKey ? 0.1 : 0.02;
                const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
                const m = d[e.key];
                if (!m) return;
                e.preventDefault();
                setFocal((f) => ({
                  x: Math.round(Math.min(1, Math.max(0, f.x + m[0])) * 1000) / 1000,
                  y: Math.round(Math.min(1, Math.max(0, f.y + m[1])) * 1000) / 1000,
                }));
              }}
            />
          </div>
          <span className="admin-muted">Drag the dot to set the focus point, so the face stays in frame on every screen size.</span>
        </>
      ) : (
        <div className="admin-audio-preview">
          <IconMusic size={40} />
          <audio controls preload="none" src={item.url} />
        </div>
      )}

      <div className="admin-stack-xs">
        <strong className="admin-break">{item.fileName.replace(/^seed:/, "")}</strong>
        <span className="admin-muted">{meta}</span>
      </div>

      <div className="admin-stack-xs">
        <span className="admin-label">Used in</span>
        <span className="admin-usedin">
          {item.usedIn.length === 0
            ? "Not used yet"
            : item.usedIn.map((u, i) => (
                <span key={`${u.eventId}-${u.slot}`}>
                  {i > 0 && ", "}
                  <Link href={`/events/${u.eventId}`}>{u.eventName}</Link> · {prettySlot(u.slot)}
                </span>
              ))}
        </span>
      </div>

      {isPhoto && (
        <Field label="Description (for screen readers)">
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} onBlur={() => alt !== item.alt && void save({ alt })} />
        </Field>
      )}

      <div className="admin-detail-actions">
        <input
          ref={replaceInput}
          type="file"
          hidden
          accept={isPhoto ? ACCEPT.photo : ACCEPT.audio}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setReplacing(true);
            try {
              const form = new FormData();
              form.append("file", f);
              onChange(await api.upload<MediaItem>(`/api/admin/media/${item.id}/replace`, form));
              toast("Replaced — every invitation using it is updated");
            } catch (err) {
              toast(errorMessage(err), "error");
            } finally {
              setReplacing(false);
              e.target.value = "";
            }
          }}
        />
        <Button variant="secondary" loading={replacing} onClick={() => replaceInput.current?.click()}>
          Replace
        </Button>
        <a className="ui-button ui-button--secondary" href={item.originalUrl} download>
          Download original
        </a>
        <Button variant="danger" block onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}

function prettySlot(slot: string) {
  const [kind, rest] = slot.split(":");
  if (kind === "photo") return `${rest.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} photo`;
  if (kind === "gallery") return "Gallery";
  if (kind === "person") return "Speaker photo";
  if (kind === "music") return "Background music";
  return slot;
}
