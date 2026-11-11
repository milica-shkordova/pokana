import { useEffect, useRef, useState, type RefObject } from "react";
import { countdownParts, formatEventDate } from "@momentelo/shared";
import { fill, useInvitation } from "./runtime";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Live countdown to the event, ticking every second. */
export function useCountdown(iso?: string) {
  const { event } = useInvitation();
  const target = iso ?? event.eventDate;
  // Render zeros on the server, real values after mount (avoids hydration mismatch).
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const parts = countdownParts(target, now ?? new Date(target).getTime() + 1);
  return { ...parts, ready: now !== null, done: now !== null && parts.done };
}

/**
 * Scroll reveal: every `[data-reveal]` element inside `root` gets
 * `data-revealed` when it scrolls into view (engine.scss animates it).
 * Watches for new elements too, so live-preview edits animate in.
 */
export function useReveal(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    const scan = () => el.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((n) => io.observe(n));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [root]);
}

/** Subtle parallax for `[data-parallax="0.15"]` elements (disabled for reduced motion). */
export function useParallax(root: RefObject<HTMLElement>) {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      el.querySelectorAll<HTMLElement>("[data-parallax]").forEach((n) => {
        const rect = n.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const factor = Number(n.dataset.parallax) || 0.12;
        const offset = (rect.top + rect.height / 2 - vh / 2) * -factor;
        n.style.setProperty("--parallax", `${offset.toFixed(1)}px`);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [root, reduced]);
}

/** RSVP deadline line, or null when no deadline is set. */
export function useRsvpDeadlineText(): string | null {
  const { event, s, locale } = useInvitation();
  if (!event.rsvpDeadline) return null;
  return fill(s.rsvpDeadline, {
    date: formatEventDate(event.rsvpDeadline, locale, { day: "numeric", month: "long" }),
  });
}

/** Background music with "tap to play" (browsers block unmuted autoplay). */
export function useMusic() {
  const { event, media } = useInvitation();
  const track = event.content.music?.mediaId ? media(event.content.music.mediaId) : null;
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!track) return;
    const audio = new Audio(track.url);
    audio.loop = true;
    audio.volume = 0.4;
    ref.current = audio;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    const onVisibility = () => {
      if (document.hidden) audio.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
      ref.current = null;
    };
  }, [track]);

  return {
    available: !!track,
    playing,
    play: () => ref.current?.play().catch(() => undefined),
    pause: () => ref.current?.pause(),
    toggle: () => (ref.current?.paused ? ref.current.play().catch(() => undefined) : ref.current?.pause()),
  };
}
