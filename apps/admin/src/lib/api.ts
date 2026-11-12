import { ApiError, createApiClient } from "@pokanito/shared";
import { useResource as useResourceBase } from "@pokanito/ui";

const base = createApiClient("");

/** The admin's URL prefix (basePath in next.config.ts). */
export const BASE_PATH = "/admin";

/** Any 401 sends the user to the login page, remembering where they were. */
async function guard<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && typeof window !== "undefined") {
      // Path inside the admin (without /admin): login's ?next= goes through the router, which adds it back.
      const p = window.location.pathname.slice(BASE_PATH.length) || "/";
      if (!p.startsWith("/login") && !p.startsWith("/accept-invite")) {
        window.location.href = `${BASE_PATH}/login?next=${encodeURIComponent(p + window.location.search)}`;
      }
    }
    throw err;
  }
}

export const api = {
  get: <T>(path: string) => guard(base.get<T>(path)),
  post: <T>(path: string, json?: unknown) => guard(base.post<T>(path, json)),
  patch: <T>(path: string, json?: unknown) => guard(base.patch<T>(path, json)),
  put: <T>(path: string, json?: unknown) => guard(base.put<T>(path, json)),
  delete: <T = void>(path: string) => guard(base.delete<T>(path)),
  /** Multipart upload (FormData). */
  upload: <T>(path: string, form: FormData) => guard(base.request<T>(path, { method: "POST", body: form })),
};

export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
export const WEB_HOST = WEB_URL.replace(/^https?:\/\//, "");

/** Tiny fetch-on-mount hook for an admin API path. Pass `null` to skip (e.g. until the router is ready). */
export function useResource<T>(path: string | null) {
  return useResourceBase<T>(path, api.get);
}
