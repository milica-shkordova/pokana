import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

/** Fired by the hero intro when it swaps its pin for the static hero. */
export const INTRO_FINISHED_EVENT = "lp:intro-finished";

/**
 * Smooth scrolling for in-page links on the landing page (header nav, hero
 * buttons, "Choose a plan", …). GSAP's ScrollToPlugin scrolls to the target
 * section; pinned sections are accounted for because the target position is
 * read from the live layout. If the hero intro unpins mid-scroll (which
 * shortens the page), the scroll re-aims at the same target. Reduced motion:
 * jump straight there.
 */
function fixedHeaderHeight() {
  const h = document.querySelector<HTMLElement>(".lp-header");
  return h && getComputedStyle(h).position === "fixed" ? h.offsetHeight : 0;
}

export function useSmoothAnchors() {
  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
    const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tween: gsap.core.Tween | null = null;
    let target: HTMLElement | null = null;

    // A full-screen layer that blurs whatever is behind it while travelling.
    // (A filter on the page itself would break the pinned sections.)
    const veil = document.createElement("div");
    veil.className = "lp-scroll-veil";
    veil.setAttribute("aria-hidden", "true");
    // Set inline: the CSS minifier collapses backdrop-filter to the -webkit-
    // form only, which Chrome ignores.
    veil.style.setProperty("backdrop-filter", "blur(10px)");
    veil.style.setProperty("-webkit-backdrop-filter", "blur(10px)");
    document.body.appendChild(veil);
    let blur: gsap.core.Timeline | null = null;

    // The section the URL hash points at. Once the user scrolls away from it
    // (it no longer covers the middle of the screen), the hash is cleared.
    let current: HTMLElement | null = null;
    let ticking = false;
    const clearHash = () => {
      current = null;
      if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
    };
    const onScroll = () => {
      if (!current || tween || ticking) return; // ignore our own travelling
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!current || tween) return;
        const r = current.getBoundingClientRect();
        const mid = window.innerHeight / 2;
        if (r.top > mid || r.bottom < mid) clearHash();
      });
    };

    const go = (el: HTMLElement, duration: number) => {
      tween?.kill();
      target = el;
      blur?.kill();
      blur = gsap
        .timeline()
        .to(veil, { autoAlpha: 1, duration: 0.15, ease: "power1.out" })
        .to(veil, { autoAlpha: 0, duration: 0.25, ease: "power1.in" }, Math.max(0.15, duration - 0.25));
      tween = gsap.to(window, {
        // On phones the header is fixed, so stop just below it.
        scrollTo: { y: el, autoKill: true, offsetY: fixedHeaderHeight() },
        duration,
        ease: "power2.inOut",
        onComplete: () => {
          tween = null;
          target = null;
        },
      });
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[href^='#']");
      if (!link) return;
      const id = decodeURIComponent(link.getAttribute("href")!.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      history.pushState(null, "", `#${id}`);
      current = el;
      if (reduced()) {
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - fixedHeaderHeight());
      } else {
        // Longer trips take a bit longer, within 0.5–1.1s.
        const distance = Math.abs(el.getBoundingClientRect().top);
        go(el, gsap.utils.clamp(0.5, 1.1, distance / 4000));
      }
      // Move keyboard focus to the section without another jump.
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };

    // The intro removed its pin mid-scroll: aim again from where we are now.
    const onIntroFinished = () => {
      if (tween && target) go(target, 0.5);
    };

    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(INTRO_FINISHED_EVENT, onIntroFinished);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(INTRO_FINISHED_EVENT, onIntroFinished);
      tween?.kill();
      blur?.kill();
      veil.remove();
    };
  }, []);
}
