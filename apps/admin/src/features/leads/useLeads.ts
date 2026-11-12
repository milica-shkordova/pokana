import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LEAD_PIPELINE, LEAD_STAGE_LABELS, type Lead } from "@pokanito/shared";
import { useToast, errorMessage } from "@pokanito/ui";
import { api, useResource } from "@/lib/api";
import { useSession } from "@/lib/session";
import { NOTE_SAVE_DELAY } from "./constants";
import { nextStage } from "./utils";

/** Leads inbox: selection (marks read), stage changes, internal note autosave and delete. */
export function useLeads() {
  const router = useRouter();
  const toast = useToast();
  const { refreshStats } = useSession();
  const { data, loading, error, reload, mutate } = useResource<Lead[]>("/api/admin/leads");
  const leads = data ?? [];
  const [selId, setSelId] = useState<string | null>(null);
  const cur = leads.find((l) => l.id === selId) ?? leads[0];

  const patch = async (lead: Lead, body: Partial<Pick<Lead, "stage" | "note" | "unread">>, quiet = false) => {
    mutate((prev) => (prev ?? []).map((l) => (l.id === lead.id ? { ...l, ...body } : l)));
    try {
      const updated = await api.patch<Lead>(`/api/admin/leads/${lead.id}`, body);
      mutate((prev) => (prev ?? []).map((l) => (l.id === updated.id ? { ...updated, note: l.note } : l)));
      if (body.unread === false || body.stage) refreshStats();
      if (!quiet && body.stage) toast(`Moved to “${LEAD_STAGE_LABELS[body.stage]}”`);
    } catch (err) {
      toast(errorMessage(err), "error");
      void reload();
    }
  };

  // Opening a lead marks it read.
  useEffect(() => {
    if (cur?.unread) void patch(cur, { unread: false }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur?.id]);

  // Internal note autosave.
  const [note, setNote] = useState("");
  useEffect(() => setNote(cur?.note ?? ""), [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!cur || note === (cur.note ?? "")) return;
    const t = setTimeout(() => void patch(cur, { note: note || null }, true), NOTE_SAVE_DELAY);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  const stageIdx = cur ? LEAD_PIPELINE.indexOf(cur.stage) : -1;
  const next = nextStage(cur);

  const remove = async (lead: Lead) => {
    if (!confirm(`Delete the lead from ${lead.name}?`)) return;
    try {
      await api.delete(`/api/admin/leads/${lead.id}`);
      mutate(leads.filter((l) => l.id !== lead.id));
      setSelId(null);
      refreshStats();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  const createEvent = (lead: Lead) => void router.push(`/events/new?lead=${lead.id}`);

  return { data, loading, error, reload, leads, cur, select: setSelId, patch, note, setNote, stageIdx, next, remove, createEvent };
}
