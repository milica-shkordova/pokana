import gsap from "gsap";

/** B8 in the hero: magnetic CTAs and mouse parallax (fine pointer only). */
export function runPointerFx(root: HTMLElement): () => void {
  const hero = root.querySelector<HTMLElement>(".lp-hero");
  if (!hero) return () => undefined;

  const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-par]")).map((el) => {
    const depth = Number(el.dataset.par) || 0;
    const vars = { duration: 0.8, ease: "power3.out" };
    return { depth, x: gsap.quickTo(el, "x", vars), y: gsap.quickTo(el, "y", vars) };
  });
  const onMove = (e: MouseEvent) => {
    const r = hero.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    // Polaroids ±16–24px, stickers ±18px, confetti the other way ±10px.
    layers.forEach((l) => {
      l.x(mx * l.depth);
      l.y(my * l.depth * 0.65);
    });
  };
  const onLeaveHero = () => layers.forEach((l) => (l.x(0), l.y(0)));
  hero.addEventListener("mousemove", onMove);
  hero.addEventListener("mouseleave", onLeaveHero);

  // Magnetic buttons: up to ~13px x / ~9px y towards the pointer. The wrapper
  // moves, so the button's own CSS hover transform is untouched.
  const mags = Array.from(root.querySelectorAll<HTMLElement>("[data-magnetic]"));
  const magMove = (e: MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    gsap.to(el, {
      x: ((e.clientX - r.left) / r.width - 0.5) * 26,
      y: ((e.clientY - r.top) / r.height - 0.5) * 18,
      duration: 0.3,
      ease: "power3.out",
      overwrite: true,
    });
  };
  const magLeave = (e: MouseEvent) => {
    gsap.to(e.currentTarget as HTMLElement, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
  };
  mags.forEach((m) => {
    m.addEventListener("mousemove", magMove);
    m.addEventListener("mouseleave", magLeave);
  });

  return () => {
    hero.removeEventListener("mousemove", onMove);
    hero.removeEventListener("mouseleave", onLeaveHero);
    mags.forEach((m) => {
      m.removeEventListener("mousemove", magMove);
      m.removeEventListener("mouseleave", magLeave);
    });
    gsap.killTweensOf(mags);
    gsap.set(mags, { clearProps: "transform" });
  };
}
