import type { ApiClient } from "./api-client";
import type { LeadInput, RsvpInput } from "./schemas";
import type {
  PublicEvent,
  PublicEventMeta,
  PublicEventResponse,
  PublicFormResponse,
  PublicSettings,
  PublicUnlockResponse,
  TemplateSummary,
} from "./types";

// The unauthenticated API used by the public site (apps/api routes/public.ts).
// Route patterns are shared with the Hono router; the builders below fill
// them in, so both sides agree on every path.

/** Where the public routes are mounted on the API (and proxied by both Next apps). */
export const PUBLIC_API_PREFIX = "/api/public";

/** Route patterns, relative to PUBLIC_API_PREFIX (Hono syntax). */
export const PUBLIC_ROUTES = {
  settings: "/settings",
  templates: "/templates",
  event: "/events/:slug",
  unlock: "/events/:slug/unlock",
  eventPreview: "/events/:slug/preview",
  preview: "/preview/:id",
  rsvp: "/events/:slug/rsvp",
  leads: "/leads",
  media: "/media/*",
} as const;

/** Header carrying the unlock token on RSVPs to access-code protected invitations. */
export const UNLOCK_TOKEN_HEADER = "x-unlock-token";

const enc = encodeURIComponent;

/** Paths of the public endpoints (append to the API origin, or "" for same-origin). */
export const publicApiPaths = {
  settings: () => `${PUBLIC_API_PREFIX}${PUBLIC_ROUTES.settings}`,
  templates: () => `${PUBLIC_API_PREFIX}${PUBLIC_ROUTES.templates}`,
  event: (slug: string) => `${PUBLIC_API_PREFIX}/events/${enc(slug)}`,
  unlock: (slug: string) => `${publicApiPaths.event(slug)}/unlock`,
  eventPreview: (slug: string, token: string) => `${publicApiPaths.event(slug)}/preview?token=${enc(token)}`,
  preview: (id: string, token: string) => `${PUBLIC_API_PREFIX}/preview/${enc(id)}?token=${enc(token)}`,
  rsvp: (slug: string) => `${publicApiPaths.event(slug)}/rsvp`,
  leads: () => `${PUBLIC_API_PREFIX}${PUBLIC_ROUTES.leads}`,
  /** A stored media file by storage key (keys contain slashes and are not encoded). */
  media: (key: string) => `${PUBLIC_API_PREFIX}/media/${key}`,
};

/** Typed calls to the public API through any ApiClient (browser or server). */
export function createPublicApi(client: ApiClient) {
  return {
    settings: () => client.get<PublicSettings>(publicApiPaths.settings()),
    /** Live + coming-soon templates for the landing page. */
    templates: () => client.get<TemplateSummary[]>(publicApiPaths.templates()),
    /** The invitation, or why it can't be shown (locked / ended / not published). */
    event: (slug: string) => client.get<PublicEventResponse>(publicApiPaths.event(slug)),
    /** Shareable client preview (`/<slug>?preview=TOKEN`). */
    eventPreview: (slug: string, token: string) => client.get<PublicEvent>(publicApiPaths.eventPreview(slug, token)),
    /** Editor live-preview (by id). */
    preview: (id: string, token: string) => client.get<PublicEvent>(publicApiPaths.preview(id, token)),
    unlock: (slug: string, code: string) => client.post<PublicUnlockResponse>(publicApiPaths.unlock(slug), { code }),
    rsvp: (slug: string, input: RsvpInput, unlockToken?: string | null) =>
      client.request<PublicFormResponse>(publicApiPaths.rsvp(slug), {
        method: "POST",
        json: input,
        headers: unlockToken ? { [UNLOCK_TOKEN_HEADER]: unlockToken } : undefined,
      }),
    lead: (input: LeadInput) => client.post<PublicFormResponse>(publicApiPaths.leads(), input),
  };
}

export type PublicApi = ReturnType<typeof createPublicApi>;

/** The minimal event info of any public response (live events included). */
export const eventMetaOf = (r: PublicEventResponse): PublicEventMeta =>
  r.state === "live"
    ? {
        slug: r.event.slug,
        name: r.event.name,
        templateId: r.event.templateId,
        eventDate: r.event.eventDate,
        languages: r.event.languages,
        noindex: r.event.noindex,
      }
    : r.meta;
