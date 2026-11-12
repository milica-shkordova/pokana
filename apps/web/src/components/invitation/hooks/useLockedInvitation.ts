import { useEffect, useState } from "react";
import { forgetCode, rememberedCode, unlock } from "@/lib/unlock";
import type { UnlockedInvitation } from "../types";

/**
 * Access-code protected invitation: tries the code remembered for this tab
 * first (`checking` until done), then waits for the form (`setState`).
 */
export function useLockedInvitation(slug: string) {
  const [state, setState] = useState<UnlockedInvitation | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const code = rememberedCode(slug);
    if (!code) {
      setChecking(false);
      return;
    }
    unlock(slug, code)
      .then((res) => setState(res))
      .catch(() => forgetCode(slug))
      .finally(() => setChecking(false));
  }, [slug]);

  return { state, setState, checking };
}
