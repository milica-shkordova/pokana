import { publicApi } from "@/lib/api";

// Access-code protected invitations: the unlock call, and the code remembered
// for this tab (sessionStorage).

const storageKey = (slug: string) => `pokanito:unlock:${slug}`;

/** Remembered access code for this tab (codes are shared with guests, not secrets). */
export function rememberedCode(slug: string): string | null {
  try {
    return sessionStorage.getItem(storageKey(slug));
  } catch {
    return null;
  }
}

export async function unlock(slug: string, code: string) {
  const res = await publicApi.unlock(slug, code);
  try {
    sessionStorage.setItem(storageKey(slug), code);
  } catch {
    /* private mode — guest just re-enters the code next time */
  }
  return res;
}

export function forgetCode(slug: string) {
  try {
    sessionStorage.removeItem(storageKey(slug));
  } catch {
    /* ignore */
  }
}
