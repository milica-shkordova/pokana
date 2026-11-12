import type { ReactNode } from "react";
import type { Locale, PublicEvent, PublicEventMeta } from "@pokanito/shared";

export interface InvitationHeadProps {
  templateId: string;
  title: string;
  slug: string;
  eventDate: string;
  locale: Locale;
  noindex: boolean;
  preview?: boolean;
}

export interface InvitationViewProps {
  event: PublicEvent;
  /** Proof the guest entered the access code (locked invitations). */
  unlockToken?: string | null;
}

export interface StateShellProps {
  meta: PublicEventMeta;
  children: ReactNode;
}

export interface StatePageProps {
  meta: PublicEventMeta;
}

export interface UnpublishedViewProps extends StatePageProps {
  error?: boolean;
}

export interface LockedViewProps extends StatePageProps {
  onUnlocked: (event: PublicEvent, token: string) => void;
}

/** An unlocked invitation and its unlock token. */
export interface UnlockedInvitation {
  event: PublicEvent;
  token: string;
}
