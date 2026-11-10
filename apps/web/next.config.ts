import type { NextConfig } from "next";
import path from "path";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const ADMIN_URL = (process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001").replace(/\/$/, "");

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
    // Browser → same-origin /api/public/* → API (forms, media files).
    // /api/revalidate and /api/og are served by this app.
    return [{ source: "/api/public/:path*", destination: `${API_URL}/api/public/:path*` }];
  },
  async headers() {
    return [
      {
        // The admin editor shows drafts in an iframe; nobody else may frame them.
        source: "/preview/:path*",
        headers: [
          { key: "Content-Security-Policy", value: `frame-ancestors 'self' ${ADMIN_URL}` },
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
