import { useEffect, useState } from "react";
import type { TemplateCategory, TemplateCreateInput, TemplateSummary } from "@pokanito/shared";
import { errorMessage } from "@pokanito/ui";
import { api } from "@/lib/api";

/** "New template" form: base layout, name and category; reset each time the dialog opens. */
export function useCreateTemplate({
  open,
  templates,
  initialBase,
  onCreated,
}: {
  open: boolean;
  templates: TemplateSummary[];
  initialBase?: string;
  onCreated: (t: TemplateSummary) => void;
}) {
  const bases = templates.filter((t) => t.implemented);
  const [baseId, setBaseId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBaseId(initialBase ?? bases[0]?.id ?? "");
    setName("");
    setCategory("");
    setError(null);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const base = bases.find((b) => b.id === baseId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await api.post<TemplateSummary>("/api/admin/templates", {
        baseId,
        name: name.trim(),
        category: category || undefined,
      } satisfies TemplateCreateInput);
      onCreated(created);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return { bases, base, baseId, setBaseId, name, setName, category, setCategory, saving, error, submit };
}
