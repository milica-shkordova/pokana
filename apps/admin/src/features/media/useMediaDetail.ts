import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@pokanito/shared";
import { useToast, errorMessage } from "@pokanito/ui";
import { api } from "@/lib/api";
import { FOCAL_STEP, FOCAL_STEP_BIG } from "./constants";
import { clampFocal } from "./utils";

/** Detail panel: focal point (drag / arrow keys, autosaved), alt text and file replace. */
export function useMediaDetail(item: MediaItem, onChange: (m: MediaItem) => void) {
  const toast = useToast();
  const [focal, setFocal] = useState({ x: item.focalX, y: item.focalY });
  const [alt, setAlt] = useState(item.alt);
  const [replacing, setReplacing] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const replaceInput = useRef<HTMLInputElement>(null);

  const save = async (body: Partial<Pick<MediaItem, "alt" | "focalX" | "focalY">>) => {
    try {
      onChange(await api.patch<MediaItem>(`/api/admin/media/${item.id}`, body));
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  // Persist focal point changes after the user stops moving it.
  useEffect(() => {
    if (focal.x === item.focalX && focal.y === item.focalY) return;
    const t = setTimeout(() => void save({ focalX: focal.x, focalY: focal.y }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focal]);

  const fromPointer = (e: React.PointerEvent) => {
    const r = frame.current!.getBoundingClientRect();
    setFocal({ x: clampFocal((e.clientX - r.left) / r.width), y: clampFocal((e.clientY - r.top) / r.height) });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    fromPointer(e);
  };
  const onPointerMove = (e: React.PointerEvent) => dragging.current && fromPointer(e);
  const onPointerUp = () => (dragging.current = false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? FOCAL_STEP_BIG : FOCAL_STEP;
    const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const m = d[e.key];
    if (!m) return;
    e.preventDefault();
    setFocal((f) => ({
      x: clampFocal(f.x + m[0]),
      y: clampFocal(f.y + m[1]),
    }));
  };

  const saveAlt = () => alt !== item.alt && void save({ alt });

  const replace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setReplacing(true);
    try {
      const form = new FormData();
      form.append("file", f);
      onChange(await api.upload<MediaItem>(`/api/admin/media/${item.id}/replace`, form));
      toast("Replaced — every invitation using it is updated");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setReplacing(false);
      e.target.value = "";
    }
  };

  return {
    focal,
    frame,
    focalHandlers: { onPointerDown, onPointerMove, onPointerUp },
    onFocalKeyDown: onKeyDown,
    alt,
    setAlt,
    saveAlt,
    replaceInput,
    replacing,
    replace,
  };
}
