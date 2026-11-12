import { useEffect, useState } from "react";
import { slugSchema, type EventDetail } from "@pokanito/shared";
import { errorMessage } from "@pokanito/ui";
import { api } from "@/lib/api";
import { SLUG_CHECK_DELAY, SLUG_CHECKING } from "./constants";
import type { SlugState } from "./types";
import type { EventEditor } from "./useEventEditor";

/** Invitation link with live availability; an available slug is saved right away. */
export function useSlugCheck(event: EventDetail, update: EventEditor["update"]) {
  const [slug, setSlug] = useState(event.slug);
  const [slugState, setSlugState] = useState<SlugState>(null);
  useEffect(() => setSlug(event.slug), [event.slug]);
  useEffect(() => {
    if (slug === event.slug) {
      setSlugState(null);
      return;
    }
    const local = slugSchema.safeParse(slug);
    if (!local.success) {
      setSlugState({
        ok: false,
        msg: local.error.issues[0]?.message ?? "Invalid link",
      });
      return;
    }
    setSlugState({ ok: false, msg: SLUG_CHECKING });
    const t = setTimeout(async () => {
      try {
        const r = await api.get<{ available: boolean; reason?: string }>(
          `/api/admin/events/slug-available?slug=${encodeURIComponent(slug)}&exceptId=${event.id}`,
        );
        setSlugState(
          r.available
            ? { ok: true, msg: "Available" }
            : { ok: false, msg: r.reason ?? "Taken" },
        );
        if (r.available) update({ slug });
      } catch (err) {
        setSlugState({ ok: false, msg: errorMessage(err) });
      }
    }, SLUG_CHECK_DELAY);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const saved = slug === event.slug;
  const checking = slugState?.msg === SLUG_CHECKING;
  /** Shown under the field: a problem with the typed slug (not while checking). */
  const error = slugState && !slugState.ok && !checking ? slugState.msg : undefined;

  return { slug, setSlug, slugState, saved, checking, error };
}
