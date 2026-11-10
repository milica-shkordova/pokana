import { env } from "../env";

// The public site statically generates pages (ISR). When the admin changes
// something, ask it to rebuild the affected paths right away instead of
// waiting for the revalidate window to expire.

export function revalidate(...paths: string[]): void {
  if (!env.REVALIDATE_SECRET || paths.length === 0) return;
  fetch(`${env.WEB_URL}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": env.REVALIDATE_SECRET,
    },
    body: JSON.stringify({ paths: [...new Set(paths)] }),
  })
    .then((res) => {
      if (!res.ok) console.warn(`[revalidate] ${paths.join(", ")} → HTTP ${res.status}`);
    })
    .catch((err: unknown) => {
      console.warn(`[revalidate] public site unreachable (${env.WEB_URL}):`, (err as Error).message);
    });
}
