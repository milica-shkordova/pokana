import { useState } from "react";
import { ApiError, type PublicEventMeta } from "@pokanito/shared";
import { unlock } from "@/lib/unlock";
import type { StateCopy } from "../copy";
import type { LockedViewProps } from "../types";

/** The access-code form of a locked invitation: code, busy, error and submit. */
export function useUnlockForm(meta: PublicEventMeta, c: StateCopy, onUnlocked: LockedViewProps["onUnlocked"]) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await unlock(meta.slug, code.trim());
      onUnlocked(res.event, res.token);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? c.tooMany : c.wrong);
      setBusy(false);
    }
  };

  return { code, setCode, busy, error, submit };
}
