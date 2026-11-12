/**
 * Finds every element the hero intro animates (`data-intro="…"` and the
 * header's logo slot / nav). Null if any is missing.
 */
export function collect(root: HTMLElement) {
  const one = (name: string) => root.querySelector<HTMLElement>(`[data-intro="${name}"]`);
  const all = (name: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-intro="${name}"]`));
  const slot = root.querySelector<HTMLElement>("[data-header-logo]");
  const nav = root.querySelector<HTMLElement>("[data-header-nav]");
  const els = {
    pin: one("pin"),
    stage: one("stage"),
    env: one("env"),
    envScale: one("env-scale"),
    hint: one("hint"),
    seal: one("seal"),
    sealL: one("seal-l"),
    sealR: one("seal-r"),
    crack: one("crack"),
    sealBody: one("seal-body"),
    sealWhole: one("seal-whole"),
    flap: one("flap"),
    flapWrap: one("flap-wrap"),
    card: one("card"),
    cardClip: one("card-clip"),
    cardInner: one("card-inner"),
    cardLogo: one("card-logo"),
    bg: one("bg"),
    dots: one("dots"),
    burst: one("burst"),
    grid: one("grid"),
    pill: one("pill"),
    words: one("words"),
    open: one("open"),
    dot: one("dot"),
    underline: root.querySelector<SVGPathElement>('[data-intro="underline"]'),
    lede: one("lede"),
    actions: one("actions"),
    scroll: one("scroll"),
    slot,
    slotImg: (slot?.firstElementChild as HTMLElement | null) ?? null,
    nav,
  };
  for (const v of Object.values(els)) if (!v) return null;
  return {
    ...(els as { [K in keyof typeof els]: NonNullable<(typeof els)[K]> }),
    parts: Array.from(root.querySelectorAll<HTMLElement>("[data-intro-part]")),
    drops: all("drop"),
    crumbs: all("crumb"),
    poppers: all("popper"),
    burstPieces: Array.from(els.burst!.children) as HTMLElement[],
  };
}

export type Els = NonNullable<ReturnType<typeof collect>>;
