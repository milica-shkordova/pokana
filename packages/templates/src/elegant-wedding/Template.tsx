import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SectionKind } from "@momentelo/shared";
import { useInvitation } from "../engine/runtime";
import { useMusic, usePrefersReducedMotion } from "../engine/hooks";
import { LanguageToggle, MusicButton, Photo, PreviewNotice } from "../engine/components";
import Overlay from "./components/Overlay";
import Hero from "./components/Hero";
import Welcome from "./components/Welcome";
import Countdown from "./components/Countdown";
import Program from "./components/Program";
import RsvpForm from "./components/RsvpForm";
import Location from "./components/Location";
import Footer from "./components/Footer";

/**
 * Elegant Wedding — the original live template. Hand-tuned GSAP
 * choreography and the tap-to-open splash (which also starts the music).
 */
export default function ElegantWedding() {
  const { sections, themeStyle, preview, embed, has, photo } = useInvitation();
  const reduced = usePrefersReducedMotion();
  const music = useMusic();
  // Previews skip the splash so edits are visible immediately; embeds (the
  // landing gallery phones) skip it so the invitation itself shows.
  const [showOverlay, setShowOverlay] = useState(!preview && !embed);
  const heroRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroImgWrapRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while the splash is visible.
  useEffect(() => {
    const b = document.body.style;
    if (showOverlay) {
      b.overflow = "hidden";
      b.position = "fixed";
      b.width = "100%";
    }
    return () => {
      b.overflow = "";
      b.position = "";
      b.width = "";
    };
  }, [showOverlay]);

  // Scroll choreography (after the splash). Reduced motion: everything visible, no scrubbing.
  useEffect(() => {
    if (showOverlay || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();
    const ctx = gsap.context(() => {
      if (document.querySelector("[data-gsap='welcome']")) {
        gsap.set("[data-gsap='welcome']", { opacity: 0, scale: 1.05 });
        gsap.to("[data-gsap='welcome']", {
          opacity: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-gsap='welcome']", start: "top 90%", end: "top 55%", scrub: 1 },
        });
      }
      const countdownItems = gsap.utils.toArray<Element>(".inv__countdown-item");
      if (countdownItems.length) {
        gsap.set(countdownItems, { opacity: 0, y: 24 });
        const cTl = gsap.timeline({
          scrollTrigger: { trigger: ".inv__countdown", start: "top 80%", end: "top 40%", scrub: 1 },
        });
        countdownItems.forEach((item, i) => cTl.to(item, { opacity: 1, y: 0, ease: "none", duration: 0.4 }, i * 0.25));
      }
      if (document.querySelector("[data-gsap='img-1']")) {
        gsap.set("[data-gsap='img-1']", { opacity: 0 });
        gsap.to("[data-gsap='img-1']", {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-gsap='img-1']", start: "top 90%", end: "top 55%", scrub: 1 },
        });
      }
      const events = gsap.utils.toArray<Element>(".inv__timeline-event");
      if (events.length) {
        gsap.set(events, { opacity: 0, y: 28 });
        const pTl = gsap.timeline({
          scrollTrigger: { trigger: "[data-gsap='program']", start: "top 70%", end: "top 20%", scrub: 1 },
        });
        events.forEach((ev, i) => pTl.to(ev, { opacity: 1, y: 0, ease: "none", duration: 0.5 }, i * 0.4));
      }
    });
    return () => ctx.revert();
  }, [showOverlay, reduced, sections]);

  // Hero intro (text glides up, photo opens in a circle) once the splash closes.
  useEffect(() => {
    const hero = heroRef.current;
    const heroText = heroTextRef.current;
    const imgWrap = heroImgWrapRef.current;
    if (!hero || !heroText || !imgWrap || reduced || preview) return;
    gsap.set(heroText, { y: (hero.offsetHeight - heroText.offsetHeight) / 2 });
    gsap.set(imgWrap, { clipPath: "circle(0% at 50% 50%)" });
    if (showOverlay) return;
    const tl = gsap.timeline();
    tl.to(heroText, { y: 0, ease: "power2.out", duration: 3 }, 0);
    tl.to(imgWrap, { clipPath: "circle(150% at 50% 50%)", ease: "power2.out", duration: 6 }, 0.6);
    return () => {
      tl.kill();
    };
  }, [showOverlay, reduced, preview]);

  const dismiss = () => {
    setShowOverlay(false);
    if (has("music")) void music.play();
  };

  // Photo bands sit between sections at fixed spots of the design.
  const band = (slot: string, gsapId?: string) =>
    (photo(slot) || preview) && (
    <div className="inv__hero-image-wrap" data-gsap={gsapId}>
      <Photo slot={slot} className="inv__hero-img" />
      <div className="inv__hero-img-overlay" />
      <div className="inv__hero-img-fade" />
    </div>
    );

  const render: Partial<Record<SectionKind, () => JSX.Element>> = {
    welcome: () => <Welcome />,
    countdown: () => (
      <>
        <Countdown />
        {band("mid", "img-1")}
      </>
    ),
    program: () => (
      <>
        <Program />
        <div className="inv__divider" />
      </>
    ),
    rsvp: () => (
      <>
        <RsvpForm />
        <div className="inv__divider" />
      </>
    ),
    location: () => (
      <>
        {band("beforeLocation")}
        <Location />
        <div className="inv__divider" />
      </>
    ),
    footer: () => <Footer />,
  };

  return (
    <main className="inv" style={themeStyle}>
      <PreviewNotice />
      {showOverlay && <Overlay onDismiss={dismiss} />}
      <LanguageToggle />
      {!showOverlay && <MusicButton />}
      <Hero heroRef={heroRef} heroTextRef={heroTextRef} heroImgWrapRef={heroImgWrapRef} />
      {sections.map((id) => (
        <Fragment key={id}>{render[id]?.()}</Fragment>
      ))}
    </main>
  );
}
