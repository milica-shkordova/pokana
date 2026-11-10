# Momentelo

Scroll-animated digital invitations for weddings, birthdays, corporate events and christenings. Each invitation is a mobile-first page at its own link (`momentelo.mk/ana-marko`). Guests open it on their phone, see the countdown, program and map, and RSVP, and every RSVP is emailed straight to the client.

The client picks a template on the landing page and sends their details. The Momentelo team builds and publishes the invitation in the admin. Clients never log in.

## Architecture

npm-workspaces monorepo:

```
apps/
  web/     Next.js (Pages Router): landing "/", invitations "/<slug>", previews, OG images      :3000
  admin/   Next.js (Pages Router): team admin (events, editor, templates, leads, media, settings) :3001
  api/     Hono + Prisma: REST API, email queue, media processing, background jobs             :4000
packages/
  ui/         @momentelo/ui: design system (tokens + React components) shared by landing and admin
  templates/  @momentelo/templates: template engine + the 9 invitation templates
  shared/     @momentelo/shared: domain constants, content model, zod schemas, API types, date helpers
```

```
 guest ─► web ──/api/public/*──┐                     ┌─► Resend (RSVP / test / lead / invite emails)
 team  ─► admin ─/api/*────────┼─► api ─► database ──┤
          web ◄─/api/revalidate┘    └─► storage      └─► jobs: email retries, daily digest, live→past
          admin ⇄ web /preview iframe (postMessage live preview)
```

- **Same-origin proxy.** Both Next apps proxy `/api` to the API, so there's no CORS and the session cookie is first-party.
- **Static invitations.** Invitations are statically generated per slug (ISR). The API asks the site to revalidate the affected pages whenever something is published or edited.
- **Live preview.** The editor's preview is the real template, rendered by the public site in an iframe (`/preview/<id>?token=…&embed=1`). The admin pushes unsaved changes into it with `postMessage` (`momentelo:preview` ⇄ `momentelo:preview-ready`), and only messages from `NEXT_PUBLIC_ADMIN_URL` are accepted.

## The template engine (`packages/templates`)

Each template is reusable code plus per-event content:

```
src/engine/            runtime (useInvitation), hooks (countdown, reveal, parallax, music),
                       useRsvpForm (5 RSVP modes), Photo/Map/LanguageToggle/MusicButton, checklist
src/<template>/        definition.ts (React-free) + Template.tsx + Template.module.scss
src/definitions.ts     React-free registry, used by the API and the admin
src/index.tsx          component registry + <Invitation event submitRsvp />
```

- An **Event** stores `templateId`, `content` (one shared content model, `packages/shared/src/content.ts`, with guest text per locale `{ mk, en }`), `theme` (colour levers with preset swatches), and `sections` (order plus on/off).
- A **definition** declares the template's sections (with editor labels such as "Agenda" or "What awaits"), photo slots (aspect, required), theme options, RSVP mode, fonts, default content (with `[Placeholders]`) and demo data.
- **Templates:**

  | id | Live on landing |
  | --- | --- |
  | elegant-wedding (the original) | ✓ |
  | rustic-wedding · minimal-wedding | coming soon |
  | kids-birthday | ✓ |
  | milestone-birthday | coming soon |
  | conference-summit | ✓ |
  | product-launch (same component as conference-summit) | coming soon |
  | classic-christening | ✓ |
  | floral-christening (same component as classic-christening) | coming soon |

- **Publish checklist** (`getPublishChecklist`, shared by the editor and the API's publish gate). It requires:
  - names, date and time
  - every required photo slot filled
  - an RSVP deadline
  - an RSVP email that has been set and tested
  - no `[placeholder]` text left
  - the client's approval
- **Motion and accessibility.** Scroll reveal, subtle parallax and a live countdown all respect `prefers-reduced-motion`. Dates always render in Europe/Skopje time. Macedonian month and day names are built in, because Chrome's ICU has no Macedonian.

### Template variants and defaults (no code)

- **Templates › New template** creates a *variant*: it reuses an existing layout (`Template.layoutId`) with its own name, category, card thumbnail, status, palette, sections and default text. Its demo starts as a copy of the base demo.
- **Edit defaults** opens the normal event editor on the template's hidden defaults event (`Event.isDefaults`). Every new event of that template starts as a copy of it. Defaults events are never listed, published or reachable by URL.
- The palette swatches and the section chips in the Templates side panel edit those same defaults.
- An event keeps `templateId` = its layout (what renders), and `variantId` = the variant it came from (for names and usage counts).
- Variants can be deleted while no events use them. Built-in templates can only be hidden.

### Adding a template (new layout, needs code)

1. Create `packages/templates/src/<id>/` with `definition.ts`, `Template.tsx` and `Template.module.scss`. Copy the closest existing template.
2. Register it in `src/definitions.ts` (`templateList`) and in `src/index.tsx` (`templateComponents`).
3. Add a catalog row to `CATALOG` in `apps/api/prisma/seed.ts`, then run `npm run db:seed`. This creates `/demo-<id>`.
4. Set its status (Live / Coming soon / Hidden) in Admin › Templates.

## Getting started

Requires Node ≥ 20.12.

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
npm run setup        # migrate + seed: owner account, settings, catalog, 9 demos, the Татјана & Драган event
npm run dev          # api :4000 · web :3000 · admin :3001
```

Sign in at http://localhost:3001 with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `apps/api/.env`.

Without `RESEND_API_KEY`, emails are printed in the API console. The full flow (test email, RSVP email, invites) still works locally.

If you see "Prisma Client did not initialize", run `npm run postinstall -w @momentelo/api`. npm ≥ 11 may skip dependency install scripts.

| Script | |
| --- | --- |
| `npm run dev` | All three apps in watch mode |
| `npm run build` | Production build of api → web → admin (web prerenders from a running API) |
| `npm run typecheck` / `npm run lint` | tsc in every workspace / ESLint across the repo |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma migrate (dev) / idempotent seed / DB browser |

## Key flows

- **RSVP.**
  1. A guest submits the form. The API rate-limits it, validates it and checks the honeypot.
  2. The RSVP is stored and queued for email.
  3. The API emails each address in the event's RSVP list, plus the owner if "Send me a copy" is on. Retries back off over roughly an hour, and failures show in the editor's Replies pane with a Resend button.
  4. With "Daily summary for clients" on, clients get one digest a day (after `DIGEST_HOUR`) instead of one email per reply.
  5. Past the deadline, the form shows a closed message.
  6. Demo invitations accept RSVPs but don't store them.
- **Publish.**
  1. The checklist must pass.
  2. The status becomes Live, and `expiresAt` is set to the event date plus "keep online" months.
  3. The page is revalidated.
  4. The day after the event, a job moves it to Past. After `expiresAt`, guests see a gentle "this invitation has ended" page.
- **Previews.** "Share preview link" produces `/<slug>?preview=<token>`. It works for drafts, lasts 14 days, and moves a draft to In review.
- **Lead → event.** The contact form and "Notify me" create leads.
  1. "Create event from lead" prefills the client, template and date, and links the lead, which moves the lead to Won.
  2. Publishing the event moves the lead to Live.
- **Password-protected invitations.** An optional access code per event. Guests type it once per session. The default comes from Settings.
- **Media.**
  - Upload JPG, PNG, HEIC (converted) or MP3. Originals are kept, and 640/1080/1600px WebP versions are generated.
  - Every photo has a focal point.
  - "Used in" and "Unused" are tracked from event content, and deleting a file that's in use asks first.
  - Storage is local in dev and S3-compatible (e.g. Cloudflare R2) in production; see `apps/api/.env.example`.
- **Team.** The users table is the allow-list. Owners invite people by email (the invite link is also shown, in case email isn't set up) and assign the Owner or Editor role.

## Environment

| App | File | Variables |
| --- | --- | --- |
| api | `apps/api/.env` | `DATABASE_URL`, `AUTH_SECRET`, `WEB_URL`, `ADMIN_URL`, `REVALIDATE_SECRET`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME` (seed), `RESEND_API_KEY`, `MEDIA_DRIVER` + `S3_*`/`MEDIA_PUBLIC_URL`, `MEDIA_QUOTA_GB`, `DIGEST_HOUR` |
| web | `apps/web/.env.local` | `API_URL`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADMIN_URL` |
| admin | `apps/admin/.env.local` | `API_URL`, `NEXT_PUBLIC_WEB_URL` |

## Deploying

- **API:** `npm run build -w @momentelo/api && npm run db:deploy -w @momentelo/api && npm run start -w @momentelo/api`.
  - For production, switch `provider` in `schema.prisma` to `postgresql`, set `DATABASE_URL`, and generate a fresh migration.
  - Use `MEDIA_DRIVER=s3` (R2).
  - Run a single instance (jobs and rate limits are in-process), or set `JOBS=off` on extra instances.
- **web / admin:** any Next.js host (e.g. Vercel), with `API_URL` pointing at the API. Keep the admin private if you can.
- **Email:** verify the sending domain (e.g. `momentelo.mk` for `rsvp@momentelo.mk`) in Resend.

## Owner TODOs (placeholders kept on purpose)

- `[PRICE]` and `[N]` on the landing page: `apps/web/src/content/landing.ts`.
- Template default content contains `[Venue]`, `[COMPANY]`, `[Name]`. The publish checklist blocks any event that still has them.
- Answers to the handoff's open questions (§12): prices, delivery time, how long invitations stay online (Settings › Links & publishing), email domain, payments, music sourcing.
