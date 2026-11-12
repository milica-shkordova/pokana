import {
  EVENT_STATUS_LABELS,
  LEAD_STAGE_LABELS,
  TEMPLATE_STATUS_LABELS,
  type EventStatus,
  type LeadStage,
  type TemplateStatus,
} from "@pokanito/shared";
import { Badge } from "./Badge";
import { eventStatusTone, leadStageTone, templateStatusTone } from "./constants";
import type { BadgeSize } from "./types";

export function EventStatusBadge({
  status,
  size,
}: {
  status: EventStatus;
  size?: BadgeSize;
}) {
  return (
    <Badge tone={eventStatusTone[status]} size={size}>
      {EVENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function TemplateStatusBadge({
  status,
  size,
}: {
  status: TemplateStatus;
  size?: BadgeSize;
}) {
  return (
    <Badge tone={templateStatusTone[status]} size={size}>
      {TEMPLATE_STATUS_LABELS[status]}
    </Badge>
  );
}

export function LeadStageBadge({
  stage,
  size = "sm",
}: {
  stage: LeadStage;
  size?: BadgeSize;
}) {
  return (
    <Badge tone={leadStageTone[stage]} size={size} style={{ fontWeight: 700 }}>
      {LEAD_STAGE_LABELS[stage]}
    </Badge>
  );
}
