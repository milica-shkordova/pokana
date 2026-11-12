import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ZodError, ZodType, ZodTypeDef } from "zod";
import type { ApiErrorBody, ValidationIssue } from "@pokanito/shared";

/** Thrown for 400s with field-level issues; rendered by the app's onError. */
export class ValidationError extends Error {
  constructor(
    readonly issues: ValidationIssue[],
    message = "Validation failed",
  ) {
    super(message);
  }
}

export function zodIssues(error: ZodError): ValidationIssue[] {
  return error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
}

export function parse<T>(schema: ZodType<T, ZodTypeDef, unknown>, data: unknown, message?: string): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new ValidationError(zodIssues(result.error), message);
  return result.data;
}

/** Reads and validates a JSON body. */
export async function body<T>(c: Context, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T> {
  const json = await c.req.json().catch(() => {
    throw new HTTPException(400, { message: "Body must be valid JSON" });
  });
  return parse(schema, json);
}

export function notFound(what = "Resource"): never {
  throw new HTTPException(404, { message: `${what} not found` });
}

export function errorBody(error: string, issues?: ValidationIssue[]): ApiErrorBody {
  return issues ? { error, issues } : { error };
}

/**
 * Requests reach the API through the Next.js apps' /api rewrite, which
 * appends the caller's address to X-Forwarded-For. The right-most entry is the
 * one added by our proxy; earlier entries are client-supplied and spoofable.
 */
export function clientIp(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return forwarded?.at(-1) || c.req.header("x-real-ip") || "unknown";
}
