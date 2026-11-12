import { useEffect, useRef, useState } from "react";
import { isPreviewReadyMessage, PREVIEW_MESSAGE, type PreviewMessage, type PublicEvent } from "@pokanito/shared";
import { errorMessage, prefersReducedMotion } from "@pokanito/ui";
import { api } from "@/lib/api";
import {
  BEZEL,
  DESKTOP_WIDTH,
  FADE_MS,
  INITIAL_DESKTOP_SCALE,
  MORPH_MS,
  PREVIEW_PUSH_MS,
  SETTLE_MS,
} from "./constants";
import type { Device, MorphPhase, PreviewUrls } from "./types";

/**
 * Preview links for the event and the iframe channel: unsaved edits are
 * pushed into it with postMessage (@pokanito/shared preview-protocol):
 *   iframe → admin  { type: "pokanito:preview-ready" }
 *   admin  → iframe { type: "pokanito:preview", event: PublicEvent }
 */
export function usePreviewFrame(eventId: string, event: PublicEvent) {
  const [urls, setUrls] = useState<PreviewUrls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(event);
  latest.current = event;
  const origin = urls ? new URL(urls.embedUrl).origin : null;

  useEffect(() => {
    api
      .post<PreviewUrls>(`/api/admin/events/${eventId}/preview-link`)
      .then(setUrls)
      .catch((err) => setError(errorMessage(err)));
  }, [eventId]);

  const send = () => {
    if (!origin) return;
    frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, event: latest.current } satisfies PreviewMessage, origin);
  };

  // Initial state once the template is ready.
  useEffect(() => {
    if (!origin) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin === origin && isPreviewReadyMessage(e.data)) send();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin]);

  // Every change, debounced.
  useEffect(() => {
    const t = setTimeout(send, PREVIEW_PUSH_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, origin]);

  return { urls, error, frame, send };
}

/**
 * The device frame: desktop scale (fit to the column) and the phone ↔
 * desktop morph.
 */
export function useDevicePreview(device: Device) {
  // Desktop mode: render at 1280 wide and scale down to fit the column
  // (measured on the column, so it is ready before switching).
  const column = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(INITIAL_DESKTOP_SCALE);
  useEffect(() => {
    const el = column.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, (entry.contentRect.width - BEZEL * 2) / DESKTOP_WIDTH)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Switching phone ↔ desktop (the iframe stays mounted, so nothing reloads):
  //   1. the screen fades out,
  //   2. the frame morphs to the new size while the screen, hidden, snaps to
  //      its new width and scale (so the template reflows once, unseen),
  //   3. the screen fades back in.
  // Animating the screen's width and scale together looked like it shrank
  // and then grew, since its on-screen size is width × scale.
  const [shown, setShown] = useState(device);
  const [phase, setPhase] = useState<MorphPhase>("idle");
  useEffect(() => {
    if (device === shown) {
      // Toggled back before the morph began.
      setPhase("idle");
      return;
    }
    if (prefersReducedMotion()) {
      setShown(device);
      return;
    }
    setPhase("out");
    const timers = [
      setTimeout(() => {
        setShown(device);
        setPhase("morph");
      }, FADE_MS),
      setTimeout(() => setPhase("in"), FADE_MS + MORPH_MS),
      setTimeout(() => setPhase("idle"), FADE_MS * 2 + MORPH_MS + SETTLE_MS),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  return { column, scale, shown, phase, desktop: shown === "desktop" };
}
