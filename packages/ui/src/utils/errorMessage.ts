import { ApiError } from "@pokanito/shared";

/** A readable message for any thrown value, including an API error's per-field issues. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.issues.length ? `${err.message}: ${err.issues.map((i) => i.message).join(" · ")}` : err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}
