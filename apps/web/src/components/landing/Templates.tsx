import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// "gsap/Flip" trips TS on Windows (types/flip.d.ts vs Flip.d.ts casing); gsap is
// side-effect free, so importing from "gsap/all" still tree-shakes to Flip only.
import { Flip } from "gsap/all";
import { useGSAP } from "@gsap/react";
import { TEMPLATE_CATEGORIES, type TemplateCategory, type TemplateSummary } from "@pokanito/shared";
import { CategoryLabel, SectionHeading, Tabs } from "@pokanito/ui";
import NotifyDialog from "./NotifyDialog";
import { fmt } from "@/content/landing";
import { useLang } from "./i18n";
import PhoneScreen, { TemplateThumb } from "./gallery/PhoneScreen";
import { clamp, focusOf, FRAME_SCALE, GAP, INNER_SCROLL, PHONE_W, STAGE_H, trackGeometry } from "./gallery/geometry";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);

type Filter = "all" | TemplateCategory;


const DESKTOP = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const MOBILE = "(max-width: 1023px) and (prefers-reduced-motion: no-preference)";
const ITEM = ".lp-gallery__item";
const HIDDEN = "is-hidden";
/** Desktop: mount demo iframes for phones within this many gaps of the centre. */
const MOUNT_RANGE = 2.5;

/** What the active motion mode exposes to React (null with reduced motion). */
interface Controller {
  /** The visible set changed (tab switch): re-measure and re-render. */
  relayout(): void;
  /** A demo iframe finished loading: re-apply its inner scroll. */
  frameLoaded(frame: HTMLIFrameElement): void;
}

/**
 * Templates — sideways gallery (HANDOFF-ANIMATIONS B4, AnimTemplates.dc.html).
 *
 * Every LIVE template is a phone showing its real demo page. Three modes via
 * gsap.matchMedia():
 * - desktop + motion: the section pins for 250% and the row of phones slides
 *   left with the scroll; the phone nearest the centre is focused (scaled,
 *   straight, its invitation scrolling inside it);
 * - < 1024px + motion: no pin; a native scroll-snap carousel, the centred phone
 *   focused via IntersectionObserver;
 * - reduced motion: the static card grid (CSS shows `.lp-gallery__grid` and
 *   hides the gallery; no JS animation at all).
 * Tab changes re-flow the phones with Flip. Filtered-out phones stay in the
 * DOM (display: none) so Flip can animate them out and back in.
 */
export default function Templates({ templates }: { templates: TemplateSummary[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const tt = useLang().t.templates;
  const CATEGORY_LABELS = tt.categories;
  const TABS: { value: Filter; label: string }[] = [
    { value: "all", label: tt.all },
    ...TEMPLATE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c].many })),
  ];
  const [notifyFor, setNotifyFor] = useState<string | null>(null);
  const [mounted, setMounted] = useState<Record<string, true>>({});

  const root = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const ctrl = useRef<Controller | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const flipTl = useRef<gsap.core.Timeline | null>(null);
  const mountedRef = useRef<Record<string, true>>({});

  const live = useMemo(() => templates.filter((t) => t.status === "live" && t.demoSlug), [templates]);
  const soon = useMemo(() => templates.filter((t) => t.status === "coming-soon"), [templates]);
  const match = (t: TemplateSummary) => filter === "all" || t.category === filter;
  const visibleLive = live.filter(match);
  const visibleSoon = soon.filter(match);
  const liveKey = live.map((t) => t.id).join("|");

  /**
   * Mount a phone's demo iframe (once; it stays mounted afterwards). Each
   * iframe lays out a whole template page on this thread in one go (a visible
   * hitch on phones), so they are queued and created one at a time, each
   * once scrolling has paused for a moment (or after at most ~4s: someone
   * scrolling straight past sees the thumbnails, which is fine).
   */
  const mounter = useRef({ queue: [] as string[], timer: undefined as number | undefined, lastScroll: 0, waited: 0 });
  useEffect(() => {
    const m = mounter.current;
    const onScroll = () => (m.lastScroll = performance.now());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(m.timer);
    };
  }, []);
  const requestMount = useCallback((id: string | undefined) => {
    const m = mounter.current;
    if (!id || mountedRef.current[id] || m.queue.includes(id)) return;
    m.queue.push(id);
    const STEP = 150;
    const tick = () => {
      m.timer = undefined;
      m.waited += STEP;
      if (performance.now() - m.lastScroll < 250 && m.waited < 4000) return schedule();
      m.waited = 0;
      const next = m.queue.shift();
      if (!next) return;
      mountedRef.current = { ...mountedRef.current, [next]: true };
      setMounted(mountedRef.current);
      if (m.queue.length) schedule();
    };
    const schedule = () => {
      if (m.timer === undefined) m.timer = window.setTimeout(tick, STEP);
    };
    schedule();
  }, []);

  const onFrameLoad = useCallback((frame: HTMLIFrameElement) => ctrl.current?.frameLoaded(frame), []);

  // ── Motion modes ──────────────────────────────────────────────────────────
  useGSAP(
    () => {
      const section = root.current;
      const viewport = viewportRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      const bar = barRef.current;
      if (!section || !viewport || !stage || !track || !bar) return;

      const allItems = () => Array.from(track.querySelectorAll<HTMLElement>(ITEM));
      const visibleItems = () => allItems().filter((el) => !el.classList.contains(HIDDEN));
      const phoneOf = (item: HTMLElement) => item.querySelector<HTMLElement>(".lp-gallery__phone")!;

      // Demo iframes only load once the section is close (keeps them out of
      // the initial page load / Lighthouse run).
      let near = false;
      const onNear = new Set<() => void>();
      const becomeNear = () => {
        if (near) return;
        near = true;
        nearIO.disconnect();
        onNear.forEach((fn) => fn());
      };
      const nearIO = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && becomeNear(), {
        rootMargin: "50% 0px",
      });
      nearIO.observe(section);

      // Inner scroll of a phone's invitation: scroll the (same-origin) demo
      // document itself, so the template's own scroll reveals play.
      const lastScroll = new WeakMap<HTMLIFrameElement, number>();
      const scrollFrame = (item: HTMLElement, screenPx: number) => {
        const frame = item.querySelector("iframe");
        if (!frame) return;
        const y = Math.round(screenPx / FRAME_SCALE);
        if (lastScroll.get(frame) === y) return;
        lastScroll.set(frame, y);
        try {
          frame.contentWindow?.scrollTo(0, y);
        } catch {
          /* not loaded yet / cross-origin: ignore */
        }
      };

      const mm = gsap.matchMedia();

      // Desktop: pinned, scrubbed sideways row.
      mm.add(DESKTOP, () => {
        const proxy = { p: 0 };
        const hover = new Map<HTMLElement, { h: number }>();
        let W = 0; // stage width in unscaled px
        let vis: HTMLElement[] = [];
        let geo = trackGeometry(0, 0);

        const measure = () => {
          // Scale the 620px-tall stage down on short viewports so phones fit.
          const k = clamp(viewport.clientHeight / STAGE_H, 0.5, 1);
          W = viewport.clientWidth / k;
          gsap.set(stage, { width: W, scale: k, x: 0, y: 0, xPercent: -50, yPercent: -50 });
          vis = visibleItems();
          geo = trackGeometry(W, vis.length);
        };

        const render = () => {
          const shift = -proxy.p * geo.travel;
          gsap.set(track, { x: geo.first - PHONE_W / 2 + shift });
          vis.forEach((item, i) => {
            const d = (geo.first + i * GAP + shift - W / 2) / GAP;
            const f = focusOf(d, hover.get(item)?.h ?? 0);
            gsap.set(phoneOf(item), { scale: f.scale, rotation: f.rotation });
            scrollFrame(item, f.scroll);
            if (near && Math.abs(d) <= MOUNT_RANGE) requestMount(item.dataset.id);
          });
          gsap.set(bar, { scaleX: proxy.p });
        };

        const tween = gsap.to(proxy, {
          p: 1,
          ease: "none",
          onUpdate: render,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=250%",
            pin: true,
            scrub: 1,
            refreshPriority: 2,
            onRefresh: () => {
              measure();
              render();
            },
          },
        });
        measure();
        render();
        onNear.add(render);

        // Hover: straighten and +0.04 (blended through render so scroll and hover compose).
        const setHover = (item: HTMLElement, h: number) => {
          let o = hover.get(item);
          if (!o) hover.set(item, (o = { h: 0 }));
          gsap.to(o, { h, duration: 0.25, ease: "power2.out", overwrite: true, onUpdate: render });
        };
        const onEnter = (e: Event) => setHover(e.currentTarget as HTMLElement, 1);
        const onLeave = (e: Event) => setHover(e.currentTarget as HTMLElement, 0);

        // Keyboard: tabbing to a phone scrolls the page so that phone is centred.
        const onFocus = (e: FocusEvent) => {
          const link = e.target as HTMLElement;
          const item = link.closest<HTMLElement>(ITEM);
          const i = item ? vis.indexOf(item) : -1;
          const st = tween.scrollTrigger;
          if (i < 0 || !st || !link.matches(":focus-visible")) return;
          const p = geo.travel > 0 ? clamp((geo.first + i * GAP - W / 2) / geo.travel, 0, 1) : 0;
          window.scrollTo(0, st.start + p * (st.end - st.start));
        };

        const items = allItems();
        items.forEach((el) => {
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
        });
        track.addEventListener("focusin", onFocus);

        ctrl.current = {
          relayout: () => {
            measure();
            render();
          },
          frameLoaded: (frame) => {
            lastScroll.delete(frame);
            render();
          },
        };

        return () => {
          ctrl.current = null;
          onNear.delete(render);
          items.forEach((el) => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
          });
          track.removeEventListener("focusin", onFocus);
          gsap.killTweensOf([...hover.values()]);
          // render() runs from callbacks outside the context; clear what it set.
          gsap.set([stage, track, bar, ...items.map(phoneOf)], { clearProps: "all" });
        };
      });

      // Tablet / phone: native scroll-snap carousel; IntersectionObserver picks the centre phone.
      mm.add(MOBILE, () => {
        const items = allItems();
        const inCentre = new Set<HTMLElement>();
        let focused: HTMLElement | null = null;
        let inner: gsap.core.Tween | null = null;

        const setFocus = (next: HTMLElement | null, force = false) => {
          if (next === focused && !force) return;
          focused = next;
          const vis = visibleItems();
          const fi = next ? vis.indexOf(next) : -1;
          items.forEach((el) => {
            const i = vis.indexOf(el);
            el.dataset.focus = i < 0 || fi < 0 ? "" : i === fi ? "center" : i < fi ? "left" : "right";
            if (el !== next) scrollFrame(el, 0);
          });
          inner?.kill();
          inner = null;
          if (next) {
            const o = { y: 0 };
            inner = gsap.to(o, {
              y: INNER_SCROLL,
              duration: 2.4,
              delay: 0.5,
              ease: "power1.inOut",
              onUpdate: () => scrollFrame(next, o.y),
            });
          }
        };

        const pick = (force = false) => {
          const r = viewport.getBoundingClientRect();
          const mid = r.left + r.width / 2;
          let best: HTMLElement | null = null;
          let bestD = Infinity;
          inCentre.forEach((el) => {
            if (el.classList.contains(HIDDEN)) return;
            const b = el.getBoundingClientRect();
            const d = Math.abs(b.left + b.width / 2 - mid);
            if (d < bestD) {
              bestD = d;
              best = el;
            }
          });
          setFocus(best, force);
        };

        const focusIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => (e.isIntersecting ? inCentre.add(e.target as HTMLElement) : inCentre.delete(e.target as HTMLElement)));
            pick();
          },
          { root: viewport, rootMargin: "0px -45% 0px -45%" },
        );

        // Mount iframes for phones on screen or one screen to either side.
        const pending = new Set<string>();
        const mountIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              const id = (e.target as HTMLElement).dataset.id;
              if (!id) return;
              if (!e.isIntersecting) pending.delete(id);
              else if (near) requestMount(id);
              else pending.add(id);
            });
          },
          { root: viewport, rootMargin: "0px 100% 0px 100%" },
        );
        const flushPending = () => pending.forEach((id) => requestMount(id));
        onNear.add(flushPending);

        items.forEach((el) => {
          focusIO.observe(el);
          mountIO.observe(el);
        });

        ctrl.current = {
          relayout: () => pick(true),
          frameLoaded: (frame) => {
            lastScroll.delete(frame);
            if (focused?.contains(frame)) setFocus(focused, true);
          },
        };

        return () => {
          ctrl.current = null;
          onNear.delete(flushPending);
          focusIO.disconnect();
          mountIO.disconnect();
          inner?.kill();
          items.forEach((el) => delete el.dataset.focus);
        };
      });

      // Reduced motion: nothing to set up; CSS renders the static grid.

      return () => {
        nearIO.disconnect();
        mm.revert();
      };
    },
    { scope: root, dependencies: [liveKey], revertOnUpdate: true },
  );

  // ── Tab change: re-flow the phones with Flip ──────────────────────────────
  const onTab = (next: Filter) => {
    if (next === filter) return;
    const track = trackRef.current;
    if (ctrl.current && track) {
      flipTl.current?.progress(1).kill();
      flipTl.current = null;
      flipState.current = Flip.getState(track.querySelectorAll(ITEM));
    }
    setFilter(next);
  };

  useGSAP(
    () => {
      const state = flipState.current;
      flipState.current = null;
      // Re-measure first so the track sits where the new row belongs; Flip then
      // animates every phone from where it was on screen.
      ctrl.current?.relayout();
      if (!state || !ctrl.current) return;
      flipTl.current = Flip.from(state, {
        duration: 0.55,
        ease: "back.out(1.4)",
        absolute: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power2.in" }),
      });
    },
    { scope: root, dependencies: [filter] },
  );

  const emptyText = (
    <p className="lp-empty">
      {filter === "all"
        ? tt.empty.all
        : fmt(tt.empty.category, { category: CATEGORY_LABELS[filter as TemplateCategory].one.toLowerCase() })}
      {visibleSoon.length > 0 ? tt.empty.soon : tt.empty.end}
    </p>
  );

  return (
    <section id="templates" ref={root} className="lp-section lp-gallery">
      <div className="lp-gallery__head">
        <SectionHeading
          data-reveal
          eyebrow={tt.eyebrow}
          title={tt.title}
          size="xl"
          lede={tt.lede}
        />
        <Tabs items={TABS} value={filter} onChange={onTab} variant="outline" align="center" aria-label={tt.tabsLabel} />
      </div>

      {/* Motion modes: the phone gallery. */}
      <div className="lp-gallery__viewport" ref={viewportRef}>
        <div className="lp-gallery__stage" ref={stageRef}>
          <div className="lp-gallery__track" ref={trackRef}>
            {live.map((t) => (
              <div key={t.id} className={`lp-gallery__item${match(t) ? "" : ` ${HIDDEN}`}`} data-id={t.id}>
                <div className="lp-gallery__phone">
                  <PhoneScreen t={t} live={!!mounted[t.id]} onFrameLoad={onFrameLoad} />
                </div>
                <div className="lp-gallery__meta" aria-hidden>
                  <span className="lp-gallery__cat">{CATEGORY_LABELS[t.category].one}</span>
                  <span className="lp-gallery__name">{t.name}</span>
                </div>
                <a
                  className="lp-gallery__link"
                  href={`/${t.demoSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={fmt(tt.openDemoAria, { name: t.name })}
                  data-cursor={tt.openDemo}
                />
              </div>
            ))}
          </div>
        </div>
        {visibleLive.length === 0 && <div className="lp-gallery__empty">{emptyText}</div>}
      </div>

      {/* Phones / tablets: "swipe for more" hint under the carousel, always shown. */}
      <div className="lp-gallery__swipe" aria-hidden>
        <span>{tt.swipe}</span>
        <svg viewBox="0 0 60 20" fill="none">
          <path className="lp-gallery__swipe-line" pathLength={100} d="M2 12 C 14 4, 26 18, 38 10 C 44 6, 50 9, 56 10" />
          <path className="lp-gallery__swipe-head" pathLength={100} d="M49 4 L 57 10 L 49 16" />
        </svg>
      </div>

      {/* Reduced motion: the static card grid (Landing.dc.html). */}
      <div className="lp-gallery__grid">
        {visibleLive.length > 0 ? (
          <div className="lp-cards">
            {visibleLive.map((t) => (
              <a key={t.id} className="lp-card" href={`/${t.demoSlug}`} target="_blank" rel="noreferrer">
                <TemplateThumb t={t} className="lp-card__thumb" />
                <div className="lp-card__body">
                  <CategoryLabel>{CATEGORY_LABELS[t.category].one}</CategoryLabel>
                  <span className="lp-card__name">{t.name}</span>
                  <span className="lp-card__desc">{t.description}</span>
                  <span className="lp-card__cta">{tt.viewDemo}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          emptyText
        )}
      </div>

      {visibleSoon.length > 0 && (
        <div className="lp-soon lp-gallery__soon" data-reveal>
          <span className="lp-soon__label">{tt.comingSoon}</span>
          {visibleSoon.map((t) => (
            <button key={t.id} type="button" className="lp-soon__chip" onClick={() => setNotifyFor(t.id)}>
              {t.name}
            </button>
          ))}
          <button type="button" className="lp-soon__notify" onClick={() => setNotifyFor(visibleSoon[0]?.id ?? "")}>
            {tt.notifyMe}
          </button>
        </div>
      )}

      <div className="lp-gallery__progress" aria-hidden>
        <span ref={barRef} />
      </div>

      <NotifyDialog
        open={notifyFor !== null}
        onClose={() => setNotifyFor(null)}
        templates={soon}
        initialTemplateId={notifyFor ?? ""}
      />
    </section>
  );
}
