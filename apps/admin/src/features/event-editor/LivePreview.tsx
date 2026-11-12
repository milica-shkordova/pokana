import type { PublicEvent } from "@pokanito/shared";
import { Spinner, cx } from "@pokanito/ui";
import { BEZEL, DESKTOP_HEIGHT, DESKTOP_WIDTH } from "./constants";
import type { Device } from "./types";
import { useDevicePreview, usePreviewFrame } from "./useDevicePreview";

/**
 * The real template on the public site, in an iframe. Unsaved edits are
 * pushed into it with postMessage (@pokanito/shared preview-protocol):
 *   iframe → admin  { type: "pokanito:preview-ready" }
 *   admin  → iframe { type: "pokanito:preview", event: PublicEvent }
 */
export default function LivePreview({ eventId, event, device }: { eventId: string; event: PublicEvent; device: Device }) {
  const { urls, error, frame, send } = usePreviewFrame(eventId, event);
  const { column, scale, shown, phase, desktop } = useDevicePreview(device);

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
