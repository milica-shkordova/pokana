import type { GetServerSideProps } from "next";
import { SITE_URL } from "@/lib/api";

// /sitemap.xml — only the landing page; invitations are private links.
export default function Sitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.end(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}/</loc><changefreq>weekly</changefreq></url>\n</urlset>\n`,
  );
  return { props: {} };
};
