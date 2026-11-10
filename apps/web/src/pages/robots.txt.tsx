import type { GetServerSideProps } from "next";
import { SITE_URL } from "@/lib/api";

// /robots.txt — invitations are noindex per event; previews never get crawled.
export default function Robots() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.end(["User-agent: *", "Allow: /", "Disallow: /preview/", "Disallow: /api/", "", `Sitemap: ${SITE_URL}/sitemap.xml`, ""].join("\n"));
  return { props: {} };
};
