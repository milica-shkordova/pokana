import type { NextApiRequest, NextApiResponse } from "next";

/**
 * On-demand ISR, called by the API when content changes in the admin panel:
 *   POST /api/revalidate  { paths: ["/", "/ana-i-marko"] }
 *   header x-revalidate-secret: $REVALIDATE_SECRET
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers["x-revalidate-secret"] !== secret) {
    return res.status(401).json({ error: "Invalid revalidate secret" });
  }

  const paths: unknown = req.body?.paths;
  if (!Array.isArray(paths) || !paths.every((p) => typeof p === "string" && p.startsWith("/"))) {
    return res.status(400).json({ error: "Body must be { paths: string[] }" });
  }

  const results = await Promise.allSettled(paths.map((p: string) => res.revalidate(p)));
  const failed = paths.filter((_, i) => results[i].status === "rejected");
  return res.status(failed.length ? 207 : 200).json({ revalidated: paths.length - failed.length, failed });
}
