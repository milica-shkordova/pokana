import { useCallback } from "react";
import type { PublicEvent, RsvpInput } from "@pokanito/shared";
import { publicApi } from "@/lib/api";

/** The template's RSVP submit for `event`: posts to the API (previews never post). */
export function useRsvpSubmit(event: PublicEvent, unlockToken?: string | null) {
  return useCallback(
    async (input: RsvpInput) => {
      if (event.preview) {
        await new Promise((r) => setTimeout(r, 400)); // previews never post
        return;
      }
      // 201 = stored, 202 = demo (accepted, not stored). Anything else throws
      // an ApiError, which the template turns into its error message.
      await publicApi.rsvp(event.slug, input, unlockToken);
    },
    [event.slug, event.preview, unlockToken],
  );
}
