import { useState } from "react";
import { useRouter } from "next/router";
import type { TemplateSummary } from "@pokanito/shared";
import { useToast, errorMessage } from "@pokanito/ui";
import { api, useResource } from "@/lib/api";
import type { Cat } from "./types";
import { categoryTabs } from "./utils";

/** Templates page: list, category filter, selection and the "new template" dialog. */
export function useTemplateLibrary() {
  const router = useRouter();
  const toast = useToast();
  const { data, loading, error, reload, mutate } = useResource<TemplateSummary[]>("/api/admin/templates");
  const [cat, setCat] = useState<Cat>("all");
  const [selId, setSelId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const list = data ?? [];
  const items = list.filter((t) => cat === "all" || t.category === cat);
  const sel = list.find((t) => t.id === selId) ?? items[0];

  const replace = (updated: TemplateSummary) => mutate(list.map((t) => (t.id === updated.id ? updated : t)));

  const cats = categoryTabs(list);

  const removeSelected = () => {
    if (!sel) return;
    mutate(list.filter((x) => x.id !== sel.id));
    setSelId(null);
  };

  const openDefaults = async () => {
    if (!sel) return;
    try {
      const { eventId } = await api.post<{ eventId: string }>(`/api/admin/templates/${sel.id}/defaults`);
      await router.push(`/events/${eventId}`);
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  const created = (t: TemplateSummary) => {
    mutate([...list, t]);
    setCat("all");
    setSelId(t.id);
    setCreating(false);
    toast(`“${t.name}” created as a draft. Set its palette, sections and defaults, then make it Live.`);
  };

  return {
    data,
    loading,
    error,
    reload,
    list,
    items,
    sel,
    select: setSelId,
    cat,
    setCat,
    cats,
    creating,
    openCreate: () => setCreating(true),
    closeCreate: () => setCreating(false),
    replace,
    removeSelected,
    openDefaults,
    created,
  };
}
