import type { ApiErrorBody, ValidationIssue } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly issues: ValidationIssue[];

  constructor(status: number, body: Partial<ApiErrorBody> | null) {
    super(body?.error ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.issues = body?.issues ?? [];
  }
}

export interface ApiClient {
  request<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T>;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, json?: unknown): Promise<T>;
  patch<T>(path: string, json?: unknown): Promise<T>;
  put<T>(path: string, json?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

/**
 * Minimal typed fetch wrapper. `baseUrl` is "" in the browser (requests go
 * through the Next.js `/api` rewrite, same-origin) and the API's internal URL
 * when called from getStaticProps/getServerSideProps.
 */
export function createApiClient(baseUrl = ""): ApiClient {
  async function request<T>(
    path: string,
    { json, headers, ...init }: RequestInit & { json?: unknown } = {},
  ): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      credentials: "include",
      ...init,
      headers: {
        Accept: "application/json",
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : init.body,
    });

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { error: text };
    }

    if (!res.ok) throw new ApiError(res.status, body as ApiErrorBody | null);
    return body as T;
  }

  return {
    request,
    get: (path) => request(path, { method: "GET" }),
    post: (path, json) => request(path, { method: "POST", json }),
    patch: (path, json) => request(path, { method: "PATCH", json }),
    put: (path, json) => request(path, { method: "PUT", json }),
    delete: (path) => request(path, { method: "DELETE" }),
  };
}
