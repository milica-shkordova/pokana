import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, createApiClient } from "@momentelo/shared";

const base = createApiClient("");

/** Any 401 sends the user to the login page, remembering where they were. */
async function guard<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && typeof window !== "undefined") {
      const p = window.location.pathname;
      if (!p.startsWith("/login") && !p.startsWith("/accept-invite")) {
        window.location.href = `/login?next=${encodeURIComponent(p + window.location.search)}`;
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

interface ResourceState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

/** Tiny fetch-on-mount hook. Pass `null` to skip (e.g. until the router is ready). */
export function useResource<T>(path: string | null) {
  const [state, setState] = useState<ResourceState<T>>({ data: undefined, error: undefined, loading: !!path });
  const latest = useRef(path);
  latest.current = path;

  const reload = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const data = await api.get<T>(path);
      if (latest.current === path) setState({ data, error: undefined, loading: false });
    } catch (error) {
      if (latest.current === path) setState((s) => ({ ...s, error: error as Error, loading: false }));
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mutate = useCallback((data: T | ((prev: T | undefined) => T)) => {
    setState((s) => ({ ...s, data: typeof data === "function" ? (data as (p: T | undefined) => T)(s.data) : data }));
  }, []);

  return { ...state, reload, mutate };
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.issues.length ? `${err.message}: ${err.issues.map((i) => i.message).join(" · ")}` : err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
