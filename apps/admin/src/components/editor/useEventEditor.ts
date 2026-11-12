import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import type { EventContent, EventDetail, EventUpdateInput } from "@pokanito/shared";
import { api } from "@/lib/api";

/** Top-level fields the editor can change (autosaved via PATCH). */
export type EditableKey = Extract<keyof EventUpdateInput, keyof EventDetail>;

const SAVE_DELAY = 800;

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

/**
 * Editor state with autosave. `draft` is what the UI shows; changes mark
 * their top-level key dirty and are PATCHed after a short pause. If the user
 * keeps typing while a save is in flight, their newer values win over the
 * server response.
 */
export function useEventEditor(id: string | null) {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDetail | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<unknown>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const draftRef = useRef<EventDetail | null>(null);
  const dirty = useRef(new Set<EditableKey>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);

  const setBoth = (next: EventDetail) => {
    draftRef.current = next;
    setDraft(next);
  };

  useEffect(() => {
    if (!id) return;
    api
      .get<EventDetail>(`/api/admin/events/${id}`)
      .then((e) => {
        setBoth(e);
        setSavedAt(new Date(e.updatedAt).getTime());
      })
      .catch((err) => setLoadError(err as Error));
  }, [id]);

  const save = useCallback(async (): Promise<void> => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (inFlight.current) {
      await inFlight.current;
    }
    const current = draftRef.current;
    if (!current || dirty.current.size === 0) return;
    const keys = [...dirty.current];
    dirty.current.clear();
    const patch = Object.fromEntries(keys.map((k) => [k, current[k]])) as EventUpdateInput;
    setSaveState("saving");

    const run = (async () => {
      try {
        const res = await api.patch<EventDetail>(`/api/admin/events/${current.id}`, patch);
        const latest = draftRef.current ?? res;
        // Keep values edited since the request left; take everything else from the server.
        const keep = Object.fromEntries([...dirty.current].map((k) => [k, latest[k]]));
        setBoth({ ...res, ...keep });
        setSaveError(null);
        setSavedAt(Date.now());
        setSaveState(dirty.current.size ? "dirty" : "saved");
      } catch (err) {
        keys.forEach((k) => dirty.current.add(k)); // retry these next time
        setSaveError(err);
        setSaveState("error");
      }
    })();
    inFlight.current = run;
    await run;
    inFlight.current = null;
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), SAVE_DELAY);
  }, [save]);

  /** Change top-level fields (marked dirty, autosaved). */
  const update = useCallback(
    (patch: Partial<Pick<EventDetail, EditableKey>>) => {
      const cur = draftRef.current;
      if (!cur) return;
      (Object.keys(patch) as EditableKey[]).forEach((k) => dirty.current.add(k));
      setBoth({ ...cur, ...patch });
      setSaveState("dirty");
      schedule();
    },
    [schedule],
  );

  /** Immutable update of the content JSON. */
  const updateContent = useCallback(
    (fn: (c: EventContent) => EventContent) => {
      const cur = draftRef.current;
      if (!cur) return;
      update({ content: fn(cur.content) });
    },
    [update],
  );

  /** Replace server-owned fields (status, rsvpTestedAt…) without marking anything dirty. */
  const applyServer = useCallback((server: EventDetail) => {
    const latest = draftRef.current ?? server;
    const keep = Object.fromEntries([...dirty.current].map((k) => [k, latest[k]]));
    setBoth({ ...server, ...keep });
  }, []);

  // Guard: flush on route change, warn on tab close while unsaved.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current.size || inFlight.current) {
        void save();
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const onRouteChange = () => {
      if (dirty.current.size) void save();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    router.events.on("routeChangeStart", onRouteChange);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      router.events.off("routeChangeStart", onRouteChange);
    };
  }, [router.events, save]);

  return { draft, loadError, saveState, saveError, savedAt, update, updateContent, save, applyServer };
}

export type EventEditor = ReturnType<typeof useEventEditor>;
