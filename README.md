# Invy

Invy is a Next.js app with two halves:

1. A **marketing landing page** (`/`) that explains what Invy does and shows a gallery of invitation templates.
2. A **multi-client invitation system** — each client's personalized invitation is a static page at its own route (e.g. `/tatjana-i-dragan`), built from a shared, reusable template plus that client's own config.

The idea: a couple (or company, or parent) contacts us through the landing page, picks a template, sends over their details, and we hand-add their config to the codebase and redeploy — their invitation goes live at its own link.

## Tech stack

- **Next.js 16** (Pages Router, not the App Router) + React 18 + TypeScript
- **Sass** for styling — one `.scss` file per component, aggregated in `src/theme/index.scss`
- **GSAP** (`ScrollTrigger`) for scroll-driven animations, on both the landing page and the invitation templates
- **Web3Forms** for form submissions (RSVP forms and the landing page's contact form) — no backend/database of our own
- `sharp` (a transitive dependency of Next.js image handling) is also used by a one-off script for logo background removal

There is no database. Content lives in TypeScript config files committed to the repo; "publishing" a new client means adding a file and redeploying.

## Project structure

```
src/
├── pages/
│   ├── index.tsx        # Invy landing page
│   ├── [slug].tsx        # Renders a client's invitation by slug (getStaticProps/getStaticPaths)
│   ├── _app.tsx, _document.tsx, 404.tsx
├── templates/
│   ├── types.ts           # TemplateId union — add a new id here when a new template is built
│   ├── index.ts            # TemplateId -> component registry
│   ├── registry.ts         # Gallery metadata shown on the landing page (see below)
│   └── wedding/            # The one template that's actually implemented today
│       ├── index.tsx        # WeddingTemplate(config, clientSlug) — the full invitation page
│       ├── types.ts          # WeddingConfig shape
│       └── components/       # Hero, Countdown, RsvpForm, Program, Location, etc.
├── clients/
│   ├── types.ts            # ClientEntry = { slug, templateId, config }
│   ├── index.ts             # clients[] + getClientBySlug() / getAllSlugs()
│   ├── tatjana-i-dragan.ts   # A real, live client
│   └── demo-wedding.ts       # Sanitized placeholder client, used as the gallery's public demo
├── components/landing/     # Landing-page-only components (Hero, TemplateGallery, ContactForm, ...)
├── styles/
│   ├── templates/wedding/   # Wedding template's scss (moved out of the old flat src/styles/)
│   └── landing/              # Landing page's scss
├── theme/                  # Global reset + the @import aggregator (index.scss)
└── lib/web3forms.ts        # Web3Forms submit helper + per-client env var key lookup
```

## How the invitation system works

**Templates** (`src/templates/<id>/`) are reusable component trees that take a typed `config` object as a prop — they contain no hardcoded client data. Only one exists today: `wedding`.

**Clients** (`src/clients/<slug>.ts`) are one file per real invitation: which template it uses, plus that client's actual config (names, date, venue, photos, ...). They're collected in `src/clients/index.ts`.

**Routing**: `src/pages/[slug].tsx` uses `getStaticPaths` (built from `getAllSlugs()`) and `getStaticProps` to statically generate one page per client at build time. An unknown slug returns `notFound: true`, which renders `src/pages/404.tsx`. Nothing is rendered dynamically at request time — every client page is pre-built HTML.

### Adding a new client

1. Copy `src/clients/tatjana-i-dragan.ts` to `src/clients/<new-slug>.ts` and fill in that client's details (matches the `WeddingConfig` shape in `src/templates/wedding/types.ts` until a second template exists).
2. Register it in the `clients` array in `src/clients/index.ts`.
3. Add a Web3Forms access key for their RSVP form to `.env.local`: `NEXT_PUBLIC_WEB3FORMS_KEY_<SLUG_UPPER_SNAKE>=...` (see `.env.example`). Get a free key at [web3forms.com](https://web3forms.com) — it just needs the email address RSVPs should land in.
4. Redeploy. Their invitation is now live at `/<new-slug>`.

### Adding a new template (e.g. "birthday")

1. Add the id to the `TemplateId` union in `src/templates/types.ts`.
2. Build `src/templates/<id>/` (component tree + `types.ts` for its config shape), following the `wedding/` folder as a reference.
3. Add its scss under `src/styles/templates/<id>/` and `@import` it from `src/theme/index.scss`.
4. Register the component in `src/templates/index.ts`.
5. Update `src/templates/registry.ts` (see below) so it shows up in the landing page's gallery as `"available"`, and point `demoSlug` at a new sanitized demo client.

## The landing page

`src/pages/index.tsx` composes the sections in `src/components/landing/`: Hero, WhatWeDo, TemplateGallery, HowItWorks, ContactSection, Footer. Scroll animations are wired centrally in `pages/index.tsx` — card grids (features, gallery, steps) get a staggered "pop in" via `ScrollTrigger`, everything else gets a simple fade-up.

### Template gallery (`src/templates/registry.ts`)

This is a plain data file, independent from the `clients`/`templates` system above — it's just what's *displayed* on the landing page, and doesn't have to correspond 1:1 with what's actually built. Each entry has a `status` of `"available"` (links to a live `demoSlug` client) or `"coming-soon"` (shown as a locked placeholder card). The gallery groups entries by `eventType` and shows a category tab per event type (derived automatically — no separate list to maintain). There are currently 12 entries across 4 categories (Wedding, Birthday, Corporate, Christening); only one ("Elegant Wedding") is real, the rest are placeholders describing templates not built yet.

Filtering by tab doesn't unmount cards — it toggles a `hidden` class (`display: none`) — because the scroll-reveal animation only runs once on page load; unmounting and remounting a card would leave it permanently invisible.

### Contact form

`src/components/landing/ContactForm.tsx` submits leads (name, contact info, template of interest, message) to Web3Forms via `NEXT_PUBLIC_INVY_CONTACT_WEB3FORMS_KEY`. This is a *lead capture* form — it doesn't create a client automatically. Turning a lead into a live invitation is the manual "adding a new client" process above.

## Environment variables

All form submissions happen client-side via Web3Forms, so keys must be `NEXT_PUBLIC_`-prefixed. Copy `.env.example` to `.env.local` (gitignored) and fill in real keys:

- `NEXT_PUBLIC_INVY_CONTACT_WEB3FORMS_KEY` — landing page contact form
- `NEXT_PUBLIC_WEB3FORMS_KEY_<SLUG>` — one per client, used by that client's RSVP form (looked up by `src/lib/web3forms.ts` from the client's slug)

## Local development

```bash
npm run dev      # start the dev server
npm run build    # production build (also validates getStaticPaths/getStaticProps + types)
npm run start    # run a production build
```

`npm run lint` is currently broken — `eslint.config.js` is unmodified leftover from the project's original Vite scaffold and references a plugin (`eslint-plugin-react-refresh`) that isn't installed. This predates the Invy work and hasn't been fixed.

## Known gaps / not yet set up

- No deployment config in the repo (no `vercel.json` etc.) — sub-routes work on any Next.js host, but nothing is wired to a specific platform yet.
- No admin UI or database — onboarding a client is a manual PR + redeploy, by design (see project history/decisions for why).
- Most gallery entries are placeholders describing templates that don't exist in code yet.
