import Link from "next/link";
import type { EventDetail } from "@pokanito/shared";
import type { TemplateDefinition } from "@pokanito/templates/definitions";
import { Button, ButtonLink, EventStatusBadge, Segmented, IconBack, IconDesktop, IconPhone } from "@pokanito/ui";
import type { Device } from "./types";
import type { SaveState } from "./useEventEditor";
import type { PublishActions } from "./usePublishActions";

/** Back link, event name + save status, device toggle, share and publish. */
export default function EditorHeader({
  draft,
  def,
  saveState,
  saveLabel,
  onRetry,
  device,
  onDevice,
  actions,
  ready,
}: {
  draft: EventDetail;
  def: TemplateDefinition;
  saveState: SaveState;
  saveLabel: string;
  onRetry: () => void;
  device: Device;
  onDevice: (d: Device) => void;
  actions: PublishActions;
  ready: boolean;
}) {
  const { publish, publishing, share, sharing } = actions;
  return (
    <header className="admin-editor__top">
      <Link href={draft.isDefaults ? "/templates" : "/"} className="admin-editor__back">
        <IconBack />
        {draft.isDefaults ? "Templates" : "Events"}
      </Link>
      <span className="admin-editor__divider" aria-hidden />
      <div className="admin-editor__title">
        <span className="admin-editor__name">{draft.isDefaults ? `${draft.templateName}: defaults` : draft.name}</span>
        <span className="ui-muted" aria-live="polite">
          {draft.isDefaults ? `Template defaults · ${def.name} layout` : draft.templateName} · {saveLabel}
          {saveState === "error" && (
            <>
              {" "}
              <Button variant="link" onClick={onRetry}>
                Retry
              </Button>
            </>
          )}
        </span>
      </div>
      {!draft.isDefaults && <EventStatusBadge status={draft.status} />}
      <div className="admin-editor__actions">
        <Segmented
          inline
          label="Preview device"
          value={device}
          onChange={onDevice}
          options={[
            { value: "phone", label: <IconPhone />, ariaLabel: "Phone preview" },
            { value: "desktop", label: <IconDesktop />, ariaLabel: "Desktop preview" },
          ]}
        />
        {draft.isDefaults ? (
          <ButtonLink href="/templates">Done</ButtonLink>
        ) : (
          <Button variant="secondary" onClick={share} loading={sharing}>
            Share preview link
          </Button>
        )}
        {draft.isDefaults ? null : draft.status === "live" ? (
          <Button variant="secondary" onClick={publish} loading={publishing}>
            Unpublish
          </Button>
        ) : (
          <Button onClick={publish} loading={publishing} title={ready ? undefined : "Finish the checklist first"}>
            {draft.status === "past" ? "Republish" : "Publish"}
          </Button>
        )}
      </div>
    </header>
  );
}
