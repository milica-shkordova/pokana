import { createApiClient, createPublicApi, envUrl } from "@pokanito/shared";

/**
 * Server-side (getStaticProps / getServerSideProps / API routes): talk to the
 * API directly on its internal URL.
 */
export const API_URL = process.env.API_URL ?? "http://localhost:4000";
export const serverApi = createApiClient(API_URL);
/** Typed public endpoints, server-side. */
export const serverPublicApi = createPublicApi(serverApi);

/**
 * Browser: same-origin requests to /api/public/*, proxied to the API by the
 * rewrite in next.config.ts.
 */
export const browserApi = createApiClient("");
/** Typed public endpoints, from the browser. */
export const publicApi = createPublicApi(browserApi);

/** Public origin of this site (absolute URLs for OG tags, sitemap, robots). */
export const SITE_URL = envUrl(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000");

/** Admin URL (e.g. https://pokanito.mk/admin). Its origin may frame /preview and drive it via postMessage. */
export const ADMIN_URL = envUrl(process.env.NEXT_PUBLIC_ADMIN_URL, "http://localhost:3001/admin");
export const ADMIN_ORIGIN = new URL(ADMIN_URL).origin;
