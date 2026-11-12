import { useState } from "react";
import { useRouter } from "next/router";
import { eventUrl, type EventDetail, type EventSummary } from "@pokanito/shared";
import {
  useToast,
  type MenuItem,
  IconArchive,
  IconCopy,
  IconDownload,
  IconEdit,
  IconExternal,
  IconEye,
  IconLink,
  IconPause,
  IconQr,
  IconRestore,
  IconTrash,
  copyText,
  errorMessage,
} from "@pokanito/ui";
import { api, WEB_URL } from "@/lib/api";
import { useSession } from "@/lib/session";
import { downloadQr, exportGuests } from "./actions";
import type { EventAction, RunAction } from "./types";

/** Row menu actions and the confirmations they open (unpublish, archive, delete). */
export function useEventRowActions(reload: () => unknown) {
  const router = useRouter();
  const toast = useToast();
  const { refreshStats } = useSession();
  const [confirm, setConfirm] = useState<EventAction>(null);

  const act: RunAction = async (fn, done) => {
    try {
      await fn();
      toast(done);
      void reload();
      refreshStats();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  const copyPreview = (e: EventSummary, open: boolean) =>
    void api
      .post<{ url: string }>(`/api/admin/events/${e.id}/preview-link`)
      .then(async ({ url }) => {
        if (open) window.open(url, "_blank", "noopener");
        else {
          const ok = await copyText(url);
          toast(ok ? "Preview link copied" : "Couldn't copy", ok ? "default" : "error");
        }
      })
      .catch((err) => toast(errorMessage(err), "error"));

  /** The row menu, by status (live/past · draft/in review · archived). */
  const menuFor = (e: EventSummary): MenuItem[] => {
    const open: MenuItem = { label: "Open editor", icon: <IconEdit />, onSelect: () => void router.push(`/events/${e.id}`) };
    const duplicate: MenuItem = {
      label: "Duplicate",
      icon: <IconCopy />,
      onSelect: () =>
        void act(async () => {
          const copy = await api.post<EventDetail>(`/api/admin/events/${e.id}/duplicate`);
          await router.push(`/events/${copy.id}`);
        }, "Duplicated"),
    };
    const guests: MenuItem = { label: "Export guest list", icon: <IconDownload />, hint: "CSV", onSelect: () => exportGuests(e) };
    const archive: MenuItem = {
      label: "Archive",
      icon: <IconArchive />,
      danger: true,
      divider: true,
      onSelect: () => setConfirm({ kind: "archive", event: e }),
    };

    if (e.status === "archived") {
      return [
        open,
        {
          label: "Restore",
          icon: <IconRestore />,
          onSelect: () => void act(() => api.post(`/api/admin/events/${e.id}/restore`), `“${e.name}” restored`),
        },
        ...(e.rsvpCount > 0 ? [guests] : []),
        {
          label: "Delete permanently",
          icon: <IconTrash />,
          danger: true,
          divider: true,
          onSelect: () => setConfirm({ kind: "delete", event: e }),
        },
      ];
    }
    if (e.status === "live" || e.status === "past") {
      return [
        open,
        { label: "View live page", icon: <IconExternal />, onSelect: () => void window.open(eventUrl(WEB_URL, e.slug), "_blank", "noopener") },
        {
          label: "Copy link",
          icon: <IconLink />,
          onSelect: () =>
            void copyText(eventUrl(WEB_URL, e.slug)).then((ok) => toast(ok ? "Link copied" : "Couldn't copy", ok ? "default" : "error")),
        },
        {
          label: "Download QR code",
          icon: <IconQr />,
          hint: "PNG",
          onSelect: () => void downloadQr(e).catch(() => toast("Couldn't make the QR code", "error")),
        },
        guests,
        duplicate,
        ...(e.status === "live"
          ? [{ label: "Unpublish", icon: <IconPause />, onSelect: () => setConfirm({ kind: "unpublish", event: e }) }]
          : []),
        archive,
      ];
    }
    // Draft / in review.
    return [
      open,
      { label: "Preview", icon: <IconEye />, onSelect: () => copyPreview(e, true) },
      { label: "Copy preview link", icon: <IconLink />, hint: "for the client", onSelect: () => copyPreview(e, false) },
      duplicate,
      archive,
      ...(e.status === "draft"
        ? [{ label: "Delete draft", icon: <IconTrash />, danger: true, onSelect: () => setConfirm({ kind: "delete", event: e }) }]
        : []),
    ];
  };

  return {
    menuFor,
    confirm,
    closeConfirm: () => setConfirm(null),
    unpublish: (e: EventSummary) => act(() => api.post(`/api/admin/events/${e.id}/unpublish`), `“${e.name}” is back in Draft`),
    archive: (e: EventSummary, keepOnline: boolean) => act(() => api.post(`/api/admin/events/${e.id}/archive`, { keepOnline }), `“${e.name}” archived`),
    remove: (e: EventSummary) => act(() => api.delete(`/api/admin/events/${e.id}`), `“${e.name}” deleted`),
  };
}
