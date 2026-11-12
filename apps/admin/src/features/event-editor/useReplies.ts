import type { EventDetail, Rsvp } from "@pokanito/shared";
import { useToast, errorMessage } from "@pokanito/ui";
import { api, useResource } from "@/lib/api";
import { RESEND_RELOAD_MS } from "./constants";
import { replyTotals } from "./utils";

/** The event's RSVPs with totals, plus delete and "resend the reply email". */
export function useReplies(event: EventDetail) {
  const toast = useToast();
  const { data, loading, error, reload, mutate } = useResource<Rsvp[]>(`/api/admin/events/${event.id}/rsvps`);
  const rsvps = data ?? [];
  const totals = replyTotals(rsvps);

  const remove = async (r: Rsvp) => {
    if (!confirm(`Delete the reply from ${r.name}?`)) return;
    try {
      await api.delete(`/api/admin/rsvps/${r.id}`);
      mutate(rsvps.filter((x) => x.id !== r.id));
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  const resend = async (r: Rsvp) => {
    try {
      await api.post(`/api/admin/rsvps/${r.id}/resend`);
      toast("Queued — sending again now");
      setTimeout(() => void reload(), RESEND_RELOAD_MS);
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  return { data, loading, error, reload, rsvps, ...totals, remove, resend };
}
