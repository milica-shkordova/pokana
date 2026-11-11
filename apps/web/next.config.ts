import type { NextConfig } from "next";
import path from "path";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const ADMIN_URL = (process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001/admin").replace(/\/$/, "");
// Where the admin app itself runs (its own deploy); this site shows it at /admin.
const ADMIN_APP_URL = (process.env.ADMIN_APP_URL ?? "http://localhost:3001").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript/SCSS source; Next compiles them.
  transpilePackages: ["@momentelo/ui", "@momentelo/templates", "@momentelo/shared"],
  sassOptions: {
    silenceDeprecations: ["legacy-js-api", "import", "global-builtin"],
  },
  turbopack: {
    // Monorepo root, so hoisted node_modules and packages/* resolve.
    root: path.resolve(__dirname, "../.."),
  },
  async rewrites() {
    return {
      // Before pages, so /admin never reaches the [slug] invitation route.
      beforeFiles: [
        // The admin (its own Next app, basePath /admin) appears under this site.
        { source: "/admin", destination: `${ADMIN_APP_URL}/admin` },
        { source: "/admin/:path*", destination: `${ADMIN_APP_URL}/admin/:path*` },
      ],
      afterFiles: [
        // Browser → same-origin /api/* → API: forms and media files (public),
        // and the admin's calls, so its session cookie is first-party here.
        // /api/revalidate and /api/og are served by this app.
        { source: "/api/public/:path*", destination: `${API_URL}/api/public/:path*` },
        { source: "/api/admin/:path*", destination: `${API_URL}/api/admin/:path*` },
      ],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        // The admin editor shows drafts in an iframe; nobody else may frame them.
        source: "/preview/:path*",
        headers: [
          { key: "Content-Security-Policy", value: `frame-ancestors 'self' ${new URL(ADMIN_URL).origin}` },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/((?!preview/).*)",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors 'self'" }],
      },
    ];
  },
};

export default nextConfig;
