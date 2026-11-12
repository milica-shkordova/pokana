import { useEffect, useRef, useState } from "react";
import type { PublicEvent } from "@pokanito/shared";
import { Spinner, cx } from "@pokanito/ui";
import { api, errorMessage } from "@/lib/api";

const DESKTOP_WIDTH = 1280;
const DESKTOP_HEIGHT = 820;
/** Desktop frame border (px each side). */
const BEZEL = 6;
/** Match the .admin-device transitions in styles/_motion.scss. */
const FADE_MS = 160;
const MORPH_MS = 460;

/**
 * The real template on the public site, in an iframe. Unsaved edits are
 * pushed into it with postMessage:
 *   iframe → admin  { type: "pokanito:preview-ready" }
 *   admin  → iframe { type: "pokanito:preview", event: PublicEvent }
 */
export default function LivePreview({ eventId, event, device }: { eventId: string; event: PublicEvent; device: "phone" | "desktop" }) {
  const [urls, setUrls] = useState<{ url: string; embedUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(event);
  latest.current = event;
  const origin = urls ? new URL(urls.embedUrl).origin : null;

  useEffect(() => {
    api
      .post<{ url: string; embedUrl: string }>(`/api/admin/events/${eventId}/preview-link`)
      .then(setUrls)
      .catch((err) => setError(errorMessage(err)));
  }, [eventId]);

  const send = () => {
    if (!origin) return;
    frame.current?.contentWindow?.postMessage({ type: "pokanito:preview", event: latest.current }, origin);
  };

  // Initial state once the template is ready.
  useEffect(() => {
    if (!origin) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin === origin && (e.data as { type?: string } | null)?.type === "pokanito:preview-ready") send();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin]);

  // Every change, debounced.
  useEffect(() => {
    const t = setTimeout(send, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, origin]);

  // Desktop mode: render at 1280 wide and scale down to fit the column
  // (measured on the column, so it is ready before switching).
  const column = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(0.3);
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
  const [phase, setPhase] = useState<"idle" | "out" | "morph" | "in">("idle");
  useEffect(() => {
    if (device === shown) {
      // Toggled back before the morph began.
      setPhase("idle");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      setTimeout(() => setPhase("idle"), FADE_MS * 2 + MORPH_MS + 60),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);
  const desktop = shown === "desktop";

  const iframe = urls && (
    <iframe ref={frame} src={urls.embedUrl} title="Live preview of the invitation" onLoad={send} />
  );

  return (
    <aside ref={column} aria-label="Live preview" className="admin-editor__preview">
      <span className="admin-secnav__title">Live preview</span>
      {error ? (
        <p className="ui-error">{error}</p>
      ) : (
        <div
          className={cx("admin-device", `admin-device--${shown}`, phase !== "idle" && `is-${phase}`)}
          style={desktop ? { height: DESKTOP_HEIGHT * scale + BEZEL * 2 } : undefined}
        >
          <div
            className="admin-device__screen"
            style={desktop ? { width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT, transform: `scale(${scale})` } : undefined}
          >
            {iframe ?? <Spinner size="lg" />}
          </div>
        </div>
      )}
      {urls && (
        <a className="admin-link-strong" href={urls.url} target="_blank" rel="noreferrer">
          Open full preview ↗
        </a>
      )}
    </aside>
  );
}
