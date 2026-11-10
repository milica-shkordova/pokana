import gsap from "gsap";

/**
 * "How it works" ribbon journey (HANDOFF-ANIMATIONS B3, design/anim/AnimJourney.dc.html).
 *
 * The ribbon path is built from the step cards' measured layout positions, so
 * it follows whatever CSS lays out (desktop scatter or the stacked mobile
 * column) and is rebuilt on every ScrollTrigger refresh (resize, fonts,
 * images). The SVG has no viewBox: its user units are the map's CSS pixels,
 * which is also the space the envelope moves in.
 *
 * One scrubbed tween drives a 0–1 progress `p`; `render(p)` maps it to every
 * element with the prototype's formulas, so the ribbon, the envelope and the
 * step activations all use the same arc length and can't drift apart.
 */

export type JourneyMode = "desktop" | "mobile";

type Pt = [number, number];
type Seg = [Pt, Pt, Pt, Pt];
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const n1 = (v: number) => v.toFixed(1);
const segD = (s: Seg) => `C${n1(s[1][0])} ${n1(s[1][1])} ${n1(s[2][0])} ${n1(s[2][1])} ${n1(s[3][0])} ${n1(s[3][1])}`;
const pathD = (segs: Seg[]) => (segs.length ? `M${n1(segs[0][0][0])} ${n1(segs[0][0][1])}` + segs.map(segD).join(" ") : "");

/** Layout box of `el` relative to `map`'s padding edge (ignores transforms, so scaled cards measure true). */
function boxIn(el: HTMLElement, map: HTMLElement): Box {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== map) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** Path: start → a point by each of the 3 step cards → into the phone (step 4). */
function buildSegments(mode: JourneyMode, cards: Box[], phone: Box): Seg[] {
  const end: Pt = [phone.x + 12, phone.y + phone.h * 0.55];

  if (mode === "desktop") {
    // One smooth, natural curve (Catmull-Rom through the points): from the
    // top left, down past card 1's right side, a gentle valley above card 2,
    // rising under card 3, then gliding into the phone. One point per step,
    // so each segment ends where its step lights up. Points keep the riding
    // envelope (~90px with attachments) clear of the cards.
    const [c1, c2, c3] = cards;
    const pts: Pt[] = [
      [Math.max(12, c1.x - 120), Math.max(12, c1.y - 180)],
      [c1.x + c1.w + 70, c1.y + c1.h * 0.2],
      [c2.x + c2.w * 0.62, c2.y - 52],
      [c3.x + c3.w * 0.5, c3.y + c3.h + 100],
      end,
    ];
    const at = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
    const segs: Seg[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      segs.push([
        p1,
        [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
        [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
        p2,
      ]);
    }
    return segs;
  }

  // Mobile: a gentle snake down the left gutter (the space left of the cards),
  // reaching each card near its top, then curling right into the phone.
  const gutter = Math.max(20, cards[0].x / 2);
  const xs = [gutter - 6, gutter + 8, gutter - 6];
  const pts: Pt[] = [[gutter, 0], ...cards.map((c, i): Pt => [xs[i], c.y + Math.min(c.h / 2, 36)]), end];
  return pts.slice(0, -1).map((a, i) => {
    const b = pts[i + 1];
    const v = (b[1] - a[1]) * 0.5;
    const last = i === pts.length - 2;
    return [a, [a[0], a[1] + v], last ? [b[0] - 50, b[1]] : [b[0], b[1] - v], b] as Seg;
  });
}

export function setupJourney(root: HTMLElement, mode: JourneyMode): () => void {
  // render() runs every scroll frame: skip style writes that wouldn't change
  // anything (each write can invalidate style / paint).
  const written = new WeakMap<HTMLElement | SVGElement, Record<string, string>>();
  const put = (el: HTMLElement | SVGElement, prop: string, value: string) => {
    let w = written.get(el);
    if (!w) written.set(el, (w = {}));
    if (w[prop] === value) return;
    w[prop] = value;
    el.style.setProperty(prop, value);
  };
  const toggle = (el: Element, cls: string, on: boolean) => {
    if (el.classList.contains(cls) !== on) el.classList.toggle(cls, on);
  };
  const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
  const map = q<HTMLElement>(".lp-journey__map");
  const stage = q<HTMLElement>(".lp-journey__stage");
  const guide = q<SVGPathElement>(".lp-journey__guide");
  const ribbon = q<SVGPathElement>(".lp-journey__ribbon");
  const measure = q<SVGPathElement>(".lp-journey__measure");
  const grad = q<SVGLinearGradientElement>(".lp-journey__grad");
  const env = q<HTMLElement>(".lp-journey__env");
  const device = q<HTMLElement>(".lp-journey__device");
  const notif = q<HTMLElement>(".lp-journey__notif");
  const atts = Array.from(root.querySelectorAll<HTMLElement>(".lp-journey__att"));
  const items = Array.from(root.querySelectorAll<HTMLElement>(".lp-journey__steps > .lp-step"));
  const cards = items.slice(0, 3);
  const phone = items[3];
  if (!map || !stage || !guide || !ribbon || !measure || !grad || !env || !device || !notif || !phone || atts.length < 3) {
    return () => undefined;
  }

  const backOut = gsap.parseEase("back.out(1.7)");
  const attRotate = [-12, 6, 10];
  const envScale = mode === "desktop" ? 1 : 0.7;
  let total = 1;
  let stops = [0.25, 0.5, 0.75];
  let progress = 0;
  // Ribbon points sampled (every ~3px, at most 400) in layout(); render() interpolates.
  let lut = new Float32Array(0);
  let lutStep = 1;
  const pointAt = (len: number): [number, number] => {
    const n = lut.length / 2 - 1;
    if (n < 1) return [0, 0];
    const f = Math.max(0, Math.min(n, len / lutStep));
    const i = Math.min(n - 1, Math.floor(f));
    const k = f - i;
    return [lut[i * 2] + (lut[i * 2 + 2] - lut[i * 2]) * k, lut[i * 2 + 1] + (lut[i * 2 + 3] - lut[i * 2 + 1]) * k];
  };
  let alive = true; // render/layout become no-ops once cleaned up

  // Mobile/tablet: the section is pinned to one screen; the stacked steps are
  // taller than that, so they glide up as the envelope travels down.
  const inner = q<HTMLElement>(".lp-journey__inner");
  let overflow = 0;
  const headerOffset = () => {
    const h = document.querySelector<HTMLElement>(".lp-header");
    return h && getComputedStyle(h).position === "fixed" ? h.offsetHeight : 0;
  };

  function render(p: number) {
    if (mode !== "desktop" && map) {
      // Only the steps move; the heading stays on top of them (it has the
      // section background, see _journey.scss), so nothing is clipped per frame.
      put(map, "transform", `translate3d(0, -${(overflow * p).toFixed(1)}px, 0)`);
    }
    if (!alive) return;
    progress = p;
    // Ribbon draws over 0.04–0.88 of the scroll.
    const t = clamp01((p - 0.04) / 0.84);
    const len = t * total;
    put(ribbon!, "stroke-dashoffset", (total - len).toFixed(1));
    put(ribbon!, "opacity", t > 0 ? "1" : "0"); // hide the round-cap dot at length 0

    // Envelope rides the ribbon head, tilting with 35% of the path's angle.
    const pt = pointAt(len);
    const a = pointAt(Math.max(0, len - 2));
    const b = pointAt(Math.min(total, len + 2));
    const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    const arrived = clamp01((t - 0.98) / 0.02);
    put(
      env!,
      "transform",
      `translate(${n1(pt[0])}px, ${n1(pt[1])}px) translate(-50%, -50%) ` +
        `rotate(${(angle * 0.35).toFixed(1)}deg) scale(${(envScale * (1 - arrived * 0.8)).toFixed(3)})`,
    );
    put(env!, "opacity", (1 - arrived).toFixed(3));

    // Steps light up as the envelope reaches them; it collects one item at each.
    cards.forEach((card, i) => {
      const s = stops[i];
      const reached = t >= s - 0.01;
      const k = backOut(clamp01((t - s + 0.01) / 0.06));
      put(card, "opacity", reached ? "1" : "0.55");
      put(card, "transform", `scale(${(reached ? 0.92 + 0.08 * k : 0.92).toFixed(3)})`);
      toggle(card, "is-reached", reached);
      put(atts[i], "transform", `rotate(${attRotate[i]}deg) scale(${backOut(clamp01((t - s) / 0.05)).toFixed(3)})`);
    });

    // Step 4: the phone rings (decaying ±5° wiggle) and the notification pops.
    const ring = clamp01((p - 0.9) / 0.1);
    const wig = ring > 0 && ring < 1 ? Math.sin(ring * 40) * 5 * (1 - ring) : 0;
    put(device!, "transform", `rotate(${wig.toFixed(2)}deg)`);
    toggle(phone, "is-reached", p >= 0.9);
    const nb = backOut(clamp01((p - 0.9) / 0.06));
    put(notif!, "transform", `scale(${nb.toFixed(3)})`);
    put(notif!, "opacity", Math.min(1, nb * 2).toFixed(3));
  }

  function layout() {
    if (mode !== "desktop" && inner) {
      stage!.style.setProperty("--journey-h", `${window.innerHeight - headerOffset()}px`);
      // Measured untransformed; the inner block is taller than the pinned screen.
      // offsetHeight ignores transforms, so no need to reset the map's.
      overflow = Math.max(0, inner.offsetHeight - (window.innerHeight - headerOffset()) + 24);
    }
    if (!alive) return;
    const boxes = cards.map((c) => boxIn(c, map!));
    const segs = buildSegments(mode, boxes, boxIn(phone, map!));
    const d = pathD(segs);
    guide!.setAttribute("d", d);
    ribbon!.setAttribute("d", d);
    total = Math.max(1, ribbon!.getTotalLength());
    ribbon!.style.strokeDasharray = `${total} ${total + 100}`;
    const count = Math.max(2, Math.min(400, Math.ceil(total / 3)));
    lutStep = total / count;
    lut = new Float32Array((count + 1) * 2);
    for (let k = 0; k <= count; k++) {
      const q = ribbon!.getPointAtLength(k * lutStep);
      lut[k * 2] = q.x;
      lut[k * 2 + 1] = q.y;
    }
    // A step lights up as soon as the envelope reaches its card: the first
    // point on the ribbon within reach of the card box (the envelope is
    // ~70px wide). Falls back to the end of the step's segment.
    const REACH = 60;
    const samples = 400;
    const pts = Array.from({ length: samples + 1 }, (_, k) => {
      const [x, y] = pointAt((total * k) / samples);
      return { x, y };
    });
    stops = [0, 1, 2].map((i) => {
      const b = boxes[i];
      const hit = pts.findIndex((p) => {
        const dx = Math.max(b.x - p.x, 0, p.x - (b.x + b.w));
        const dy = Math.max(b.y - p.y, 0, p.y - (b.y + b.h));
        return Math.hypot(dx, dy) <= REACH;
      });
      // Desktop only: on phones the ribbon runs right beside every card.
      if (mode === "desktop" && hit >= 0) return hit / samples;
      measure!.setAttribute("d", pathD(segs.slice(0, i + 1)));
      return measure!.getTotalLength() / total;
    });
    // Gradient runs along the main direction of travel.
    grad!.setAttribute("x2", mode === "desktop" ? "1" : "0");
    grad!.setAttribute("y2", mode === "desktop" ? "0" : "1");
    render(progress);
  }

  root.classList.add("lp-journey--live");
  layout();

  const proxy = { p: 0 };
  const scrollTrigger: ScrollTrigger.Vars =
    mode === "desktop"
      ? {
          trigger: stage,
          start: "top top",
          end: "+=220%",
          pin: stage,
          scrub: 1,
          anticipatePin: 1,
          refreshPriority: 3,
          onRefresh: layout,
        }
      : {
          // Pinned like desktop (just under the fixed phone header); the
          // steps glide up inside the pinned screen (see render()).
          trigger: stage,
          start: () => `top ${headerOffset()}px`,
          end: () => `+=${Math.round(overflow + window.innerHeight * 1.2)}`,
          pin: stage,
          scrub: 1,
          anticipatePin: 1,
          refreshPriority: 3,
          invalidateOnRefresh: true,
          onRefresh: layout,
        };
  gsap.to(proxy, { p: 1, ease: "none", scrollTrigger, onUpdate: () => render(proxy.p) });

  // The tween and its ScrollTrigger are reverted by the matchMedia context;
  // this clears what render() wrote directly.
  return () => {
    alive = false;
    root.classList.remove("lp-journey--live");
    for (const el of [...items, env, device, notif, ...atts]) {
      el.classList.remove("is-reached");
      el.style.removeProperty("transform");
      el.style.removeProperty("opacity");
    }
    for (const p of [guide, ribbon, measure]) p.removeAttribute("d");
    map?.style.removeProperty("transform");
    stage.style.removeProperty("--journey-h");
    ribbon.style.removeProperty("stroke-dasharray");
    ribbon.style.removeProperty("stroke-dashoffset");
    ribbon.style.removeProperty("opacity");
  };
}
