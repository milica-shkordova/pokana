// Fonts for the link-preview image (pages/api/og/[slug]). Edge runtime: fetch only.

/** Loads a Google Font subset (TTF) containing just `text` — needed for Cyrillic names. */
export async function loadFont(
  family: string,
  axis: string,
  text: string,
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:${axis}&text=${encodeURIComponent(text)}`;
    const css = await (
      await fetch(url, { signal: AbortSignal.timeout(4000) })
    ).text();
    const src = css.match(
      /src: url\((.+?)\) format\('(opentype|truetype)'\)/,
    )?.[1];
    if (!src) return null;
    return await (
      await fetch(src, { signal: AbortSignal.timeout(4000) })
    ).arrayBuffer();
  } catch {
    return null;
  }
}

/** The serif (italic) and sans faces of the OG card, subset to `text`; missing ones are left out. */
export async function loadOgFonts(text: string) {
  const [serif, sans] = await Promise.all([
    loadFont("Cormorant Garamond", "ital,wght@1,600", text),
    loadFont("Manrope", "wght@600", text),
  ]);
  return [
    ...(serif
      ? [
          {
            name: "Serif",
            data: serif,
            weight: 600 as const,
            style: "italic" as const,
          },
        ]
      : []),
    ...(sans
      ? [
          {
            name: "Sans",
            data: sans,
            weight: 600 as const,
            style: "normal" as const,
          },
        ]
      : []),
  ];
}
