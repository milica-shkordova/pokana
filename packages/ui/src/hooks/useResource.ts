import { useCallback, useEffect, useRef, useState } from "react";

interface ResourceState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

/**
 * Tiny fetch-on-mount hook: `fetcher(key)` runs on mount and whenever `key`
 * changes. Pass `null` to skip (e.g. until the router is ready). Only the
 * latest key's result is kept. `mutate` replaces the data locally.
 */
export function useResource<T>(key: string | null, fetcher: (key: string) => Promise<T>) {
  const [state, setState] = useState<ResourceState<T>>({ data: undefined, error: undefined, loading: !!key });
  const latest = useRef(key);
  latest.current = key;
  // The fetcher may be a new function every render; only `key` triggers a load.
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;

  const reload = useCallback(async () => {
    if (!key) return;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const data = await fetchRef.current(key);
      if (latest.current === key) setState({ data, error: undefined, loading: false });
    } catch (error) {
      if (latest.current === key) setState((s) => ({ ...s, error: error as Error, loading: false }));
    }
  }, [key]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mutate = useCallback((data: T | ((prev: T | undefined) => T)) => {
    setState((s) => ({ ...s, data: typeof data === "function" ? (data as (p: T | undefined) => T)(s.data) : data }));
  }, []);

  return { ...state, reload, mutate };
}
