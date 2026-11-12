/** Up to two initials from a name or an email ("ana.k@x.mk" → "AK"); "?" if none. */
export function initials(name: string): string {
  return (
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}
