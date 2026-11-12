import { useEffect, useState } from "react";
import type { EventAction } from "./types";

/**
 * State behind the events list's confirmations: the event shown (kept while
 * a dialog animates closed), the busy flag, the archive "keep online" option
 * and the typed name for permanent delete. Reset each time a dialog opens.
 */
export function useEventDialog(action: EventAction, onClose: () => void) {
  // The last event shown stays rendered while a dialog animates closed.
  const [last, setLast] = useState<NonNullable<EventAction> | null>(action);
  useEffect(() => {
    if (action) setLast(action);
  }, [action]);
  const [busy, setBusy] = useState(false);
  const [keepOnline, setKeepOnline] = useState(false);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (!action) return;
    setBusy(false);
    setKeepOnline(false);
    setTyped("");
  }, [action]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const ev = last?.event;
  const name = ev?.name ?? "";
  const open = (kind: NonNullable<EventAction>["kind"]) => action?.kind === kind;
  const nameMatches = typed.trim() === name.trim() && name.trim() !== "";

  return { ev, name, open, busy, run, keepOnline, setKeepOnline, typed, setTyped, nameMatches };
}
