/** The `?next=` redirect after sign-in, only when it is a path inside the admin. */
export const safeNext = (next: string | string[] | undefined) => (typeof next === "string" && next.startsWith("/") ? next : "/");
