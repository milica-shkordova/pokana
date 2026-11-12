import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { guessDate, type EventCreateInput, type EventDetail, type Lead, type TemplateSummary } from "@pokanito/shared";
import { getDefinition } from "@pokanito/templates/definitions";
import { api, useResource } from "@/lib/api";
import type { Cat } from "@/features/templates/types";
import { categoryTabs, matchesFilter, suggestLead, usableTemplates } from "./utils";

/**
 * New event, step 1: filter and pick a template, then create the draft.
 * `?template=<id>` and `?lead=<id>` (with a template) create right away.
 */
export function useNewEvent() {
  const router = useRouter();
  const leadId = typeof router.query.lead === "string" ? router.query.lead : null;
  const preset = typeof router.query.template === "string" ? router.query.template : null;
  const templates = useResource<TemplateSummary[]>("/api/admin/templates");
  const leads = useResource<Lead[]>("/api/admin/leads");
  const lead = leads.data?.find((l) => l.id === leadId) ?? null;

  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [cat, setCat] = useState<Cat>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const started = useRef(false);

  const usable = useMemo(() => usableTemplates(templates.data ?? []), [templates.data]);
  const q = query.trim().toLowerCase();
  const shown = usable.filter((t) => matchesFilter(t, cat, q));
  const cats = categoryTabs(usable);
  const pick = usable.find((t) => t.id === selected) ?? shown[0] ?? null;
  const pickDef = pick ? getDefinition(pick.layoutId) : undefined;

  // A lead asking about a template that has no event yet.
  const suggestion = !leadId ? suggestLead(leads.data, usable) : null;

  const create = async (templateId: string) => {
    if (creating) return;
    setCreating(templateId);
    setError(null);
    try {
      const created = await api.post<EventDetail>("/api/admin/events", {
        templateId,
        name: lead?.name || "New event",
        eventDate: guessDate(lead?.eventDate),
        leadId: leadId ?? undefined,
      } satisfies EventCreateInput);
      await router.replace(`/events/${created.id}`);
    } catch (err) {
      setError(err);
      setCreating(null);
    }
  };

  // Template chosen elsewhere (Templates page, or the lead's template): create immediately.
  useEffect(() => {
    if (started.current || !router.isReady || !templates.data || (leadId && !leads.data)) return;
    const id = preset ?? lead?.templateId ?? null;
    if (id && templates.data.some((t) => t.id === id && t.implemented)) {
      started.current = true;
      void create(id);
    }
  });

  return { templates, lead, suggestion, creating, error, cat, setCat, cats, query, setQuery, shown, pick, pickDef, select: setSelected, create };
}
