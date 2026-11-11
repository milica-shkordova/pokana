import type { NextConfig } from "next";
import path from "path";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Served at <site>/admin: the public site proxies /admin/* to this app.
  basePath: "/admin",
  transpilePackages: ["@momentelo/ui", "@momentelo/shared", "@momentelo/templates"],
  sassOptions: {
    silenceDeprecations: ["legacy-js-api", "import", "global-builtin"],
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  async rewrites() {
    // The whole API is proxied same-origin, so the admin session cookie is
    // first-party and no CORS setup is needed. The browser calls /api/... at
    // the site root (not under /admin), hence basePath: false. Through the
    // public site, its own /api/admin rewrite answers instead.
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*`, basePath: false }];
  },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
