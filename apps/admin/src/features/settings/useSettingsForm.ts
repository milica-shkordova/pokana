import { useEffect, useState } from "react";
import { publicApiPaths, type MediaItem, type PublicSettings, type Settings } from "@pokanito/shared";
import { useToast } from "@pokanito/ui";
import { api, useResource } from "@/lib/api";
import type { SetSetting } from "./types";
import { menuTextOf, parseMenuText, resolveLogoSrc } from "./utils";

/** The settings form: local copy of the stored settings, dirty check, logo preview and save. */
export function useSettingsForm() {
  const toast = useToast();
  const remote = useResource<Settings>("/api/admin/settings");
  const [form, setForm] = useState<Settings | null>(null);
  const [menuText, setMenuText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  // The admin settings only store the logo media id; the public settings
  // resolve it to an image URL. A freshly uploaded logo previews from upload.
  const publicSettings = useResource<PublicSettings>(publicApiPaths.settings());
  const [uploadedLogo, setUploadedLogo] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (remote.data) {
      setForm(remote.data);
      setMenuText(menuTextOf(remote.data));
    }
  }, [remote.data]);

  const logoSrc = resolveLogoSrc(form, uploadedLogo, publicSettings.data);

  const dirty =
    !!form &&
    !!remote.data &&
    (JSON.stringify(form) !== JSON.stringify(remote.data) || menuText !== menuTextOf(remote.data));
  const set: SetSetting = (k, v) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const uploadLogo = (items: MediaItem[]) => {
    if (!items[0]) return;
    setUploadedLogo(items[0]);
    set("logoMediaId", items[0].id);
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const body: Settings = {
        ...form,
        defaultMenuOptions: parseMenuText(menuText),
      };
      remote.mutate(await api.put<Settings>("/api/admin/settings", body));
      toast("Settings saved");
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return { remote, form, set, menuText, setMenuText, logoSrc, uploadLogo, dirty, saving, error, save };
}
