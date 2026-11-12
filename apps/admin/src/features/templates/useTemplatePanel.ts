import { useEffect, useRef, useState } from "react";
import type { EventDetail, SectionState, TemplateSummary, TemplateUpdateInput } from "@pokanito/shared";
import { getDefinition, resolveSections } from "@pokanito/templates/definitions";
import { useToast, errorMessage } from "@pokanito/ui";
import { api, useResource } from "@/lib/api";
import { thumbStyle } from "@/components/TemplateThumb";
import { DEFAULTS_SAVE_DELAY } from "./constants";
import type { DefaultsPatch } from "./types";
import { defaultTheme } from "./utils";

export interface TemplatePanelCallbacks {
  onChange: (t: TemplateSummary) => void;
  onDeleted: () => void;
  onOpenDefaults: () => Promise<void>;
}

/**
 * Side panel state: inline-edited fields (saved on blur), the template's
 * defaults event (palette & sections, autosaved like the editor does) and
 * the delete confirmation.
 */
export function useTemplatePanel(t: TemplateSummary, { onChange, onDeleted, onOpenDefaults }: TemplatePanelCallbacks) {
  const toast = useToast();
  const def = getDefinition(t.layoutId);
  const [name, setName] = useState(t.name);
  const [description, setDescription] = useState(t.description);
  const [thumbLabel, setThumbLabel] = useState(t.thumb.label);
  const [openingDefaults, setOpeningDefaults] = useState(false);
  const [editingColour, setEditingColour] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const style = thumbStyle(t);

  // Palette & sections live in the template's defaults event (what new events copy).
  const [defaultsId, setDefaultsId] = useState(t.defaultsEventId);
  const defaults = useResource<EventDetail>(defaultsId ? `/api/admin/events/${defaultsId}` : null);
  // Unsaved panel edits sit on top of the stored defaults until the autosave returns.
  const [local, setLocal] = useState<DefaultsPatch>({});
  const theme: Record<string, string> = {
    ...defaultTheme(def),
    ...(defaults.data?.theme ?? {}),
    ...(local.theme ?? {}),
  };
  const sections: SectionState[] = def ? resolveSections(def, local.sections ?? defaults.data?.sections) : [];

  const patch = async (body: TemplateUpdateInput, message = "Saved") => {
    try {
      onChange(await api.patch<TemplateSummary>(`/api/admin/templates/${t.id}`, body));
      toast(message);
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  /** Creates the defaults event on first edit, then autosaves to it like the editor does. */
  const ensureDefaults = async () => {
    if (defaultsId) return defaultsId;
    const { eventId } = await api.post<{ eventId: string }>(`/api/admin/templates/${t.id}/defaults`);
    setDefaultsId(eventId);
    onChange({ ...t, defaultsEventId: eventId });
    return eventId;
  };
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const patchDefaults = (body: DefaultsPatch) => {
    const next = { ...local, ...body };
    setLocal(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const id = await ensureDefaults();
        defaults.mutate(await api.patch<EventDetail>(`/api/admin/events/${id}`, next));
        setLocal({});
      } catch (err) {
        toast(errorMessage(err), "error");
      }
    }, DEFAULTS_SAVE_DELAY);
  };
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const setColour = (key: string, value: string) => patchDefaults({ theme: { ...theme, [key]: value } });
  const toggleSection = (id: string) => patchDefaults({ sections: sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)) });
  const toggleEditingColour = (key: string) => setEditingColour(editingColour === key ? null : key);

  const editing = def?.themeOptions.find((o) => o.key === editingColour);

  // Inline fields save on blur, only when they changed.
  const saveName = () => name.trim() && name !== t.name && void patch({ name: name.trim() }, "Name saved");
  const saveDescription = () => description !== t.description && void patch({ description });
  const saveThumbLabel = () => thumbLabel !== t.thumb.label && void patch({ thumbLabel: thumbLabel.trim() || null });

  const openDefaults = async () => {
    setOpeningDefaults(true);
    await onOpenDefaults();
    setOpeningDefaults(false);
  };

  const deleteTemplate = async () => {
    try {
      await api.delete(`/api/admin/templates/${t.id}`);
      setConfirmDelete(false);
      toast("Template deleted");
      onDeleted();
    } catch (err) {
      setConfirmDelete(false);
      toast(errorMessage(err), "error");
    }
  };

  return {
    def,
    style,
    fields: { name, setName, saveName, description, setDescription, saveDescription, thumbLabel, setThumbLabel, saveThumbLabel },
    patch,
    palette: { theme, editingColour, editing, toggleEditingColour, setColour },
    sections,
    toggleSection,
    openingDefaults,
    openDefaults,
    confirmDelete,
    setConfirmDelete,
    deleteTemplate,
  };
}

export type TemplatePanelState = ReturnType<typeof useTemplatePanel>;
