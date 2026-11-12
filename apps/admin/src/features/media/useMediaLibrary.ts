import { useMemo, useState } from "react";
import { ApiError, type EventSummary, type MediaItem, type MediaLibrary } from "@pokanito/shared";
import { useToast, errorMessage } from "@pokanito/ui";
import { api, useResource } from "@/lib/api";
import { prependToLibrary } from "@/lib/media";
import type { InUseConfirm, TypeTab } from "./types";
import { groupByEvent } from "./utils";

/** Media library page: filters, grouping by event, selection, upload and delete. */
export function useMediaLibrary() {
  const toast = useToast();
  const lib = useResource<MediaLibrary>("/api/admin/media");
  const events = useResource<EventSummary[]>("/api/admin/events?demo=1&sort=name");
  const [eventFilter, setEventFilter] = useState<string>("");
  const [type, setType] = useState<TypeTab>("all");
  const [selId, setSelId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<InUseConfirm | null>(null);

  const items = useMemo(() => lib.data?.items ?? [], [lib.data]);
  const filtered = items.filter(
    (m) =>
      (!eventFilter || (eventFilter === "shared" ? !m.eventId : m.eventId === eventFilter)) &&
      (type === "all" || (type === "unused" ? m.usedIn.length === 0 : m.kind === type)),
  );
  const groups = useMemo(() => groupByEvent(filtered), [filtered]);
  const sel = items.find((m) => m.id === selId) ?? filtered[0];

  const replaceItem = (m: MediaItem) => lib.mutate((prev) => ({ storage: prev!.storage, items: prev!.items.map((x) => (x.id === m.id ? m : x)) }));
  const addItems = (list: MediaItem[]) => {
    lib.mutate(prependToLibrary(list));
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

  return {
    lib,
    events: events.data,
    storage: lib.data?.storage,
    items,
    groups,
    sel,
    select: setSelId,
    eventFilter,
    setEventFilter,
    /** Where new uploads from the header go: the filtered event, else shared. */
    uploadEventId: eventFilter && eventFilter !== "shared" ? eventFilter : null,
    type,
    setType,
    confirmDelete,
    closeConfirmDelete: () => setConfirmDelete(null),
    replaceItem,
    addItems,
    remove,
  };
}
