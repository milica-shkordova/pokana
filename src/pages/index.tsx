import { useEffect, useRef, useState } from "react";
import config from "@/config";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Overlay from "@components/Overlay";
import Hero from "@components/Hero";
import Welcome from "@components/Welcome";
import Countdown from "@components/Countdown";
import ImageBand from "@components/ImageBand";
import Program from "@components/Program";
import RsvpForm from "@components/RsvpForm";
import Location from "@components/Location";
import Footer from "@components/Footer";

export default function WeddingInvitation() {
  const [showOverlay, setShowOverlay] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroImgWrapRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while overlay is visible
  useEffect(() => {
    if (showOverlay) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [showOverlay]);

  // Page scroll animations (runs after overlay is dismissed)
  useEffect(() => {
    if (showOverlay) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      gsap.set("[data-gsap='welcome']", { opacity: 0, scale: 1.05 });
      gsap.to("[data-gsap='welcome']", {
        opacity: 1,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-gsap='welcome']",
          start: "top 90%",
          end: "top 55%",
          scrub: 1,
        },
      });

      const countdownItems = gsap.utils.toArray<Element>(
        ".inv__countdown-item",
      );
      gsap.set(countdownItems, { opacity: 0, y: 24 });
      const cTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".inv__countdown",
          start: "top 80%",
          end: "top 40%",
          scrub: 1,
        },
      });
      countdownItems.forEach((item, i) => {
        cTl.to(
          item,
          { opacity: 1, y: 0, ease: "none", duration: 0.4 },
          i * 0.25,
        );
      });

      gsap.set("[data-gsap='img-1']", { opacity: 0 });
      gsap.to("[data-gsap='img-1']", {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-gsap='img-1']",
          start: "top 90%",
          end: "top 55%",
          scrub: 1,
        },
      });

      const events = gsap.utils.toArray<Element>(".inv__timeline-event");
      gsap.set(events, { opacity: 0, y: 28 });
      const pTl = gsap.timeline({
        scrollTrigger: {
          trigger: "[data-gsap='program']",
          start: "top 70%",
          end: "top 20%",
          scrub: 1,
        },
      });
      events.forEach((ev, i) => {
        pTl.to(ev, { opacity: 1, y: 0, ease: "none", duration: 0.5 }, i * 0.4);
      });
    });

    return () => ctx.revert();
  }, [showOverlay]);

  // Hero intro animation (plays once when overlay is dismissed)
  useEffect(() => {
    const hero = heroRef.current;
    const heroText = heroTextRef.current;
    const imgWrap = heroImgWrapRef.current;
    if (!hero || !heroText || !imgWrap) return;

    const centerY = (hero.offsetHeight - heroText.offsetHeight) / 2;
    gsap.set(heroText, { y: centerY });
    gsap.set(imgWrap, { clipPath: "circle(0% at 50% 50%)" });

    if (showOverlay) return;

    const tl = gsap.timeline();
    tl.to(heroText, { y: 0, ease: "power2.out", duration: 3 }, 0);
    tl.to(
      imgWrap,
      { clipPath: "circle(150% at 50% 50%)", ease: "power2.out", duration: 6 },
      0.6,
    );

    return () => {
      tl.kill();
    };
  }, [showOverlay]);

  // Audio autoplay with interaction fallback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;
    const tryPlay = () => {
      audio.play().catch(() => {});
    };
    tryPlay();
    const startOnInteraction = () => {
      tryPlay();
      document.removeEventListener("touchstart", startOnInteraction);
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("scroll", startOnInteraction);
    };
    document.addEventListener("touchstart", startOnInteraction, { once: true });
    document.addEventListener("click", startOnInteraction, { once: true });
    document.addEventListener("scroll", startOnInteraction, { once: true });
    const handleVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("touchstart", startOnInteraction);
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("scroll", startOnInteraction);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleDismiss = () => {
    setShowOverlay(false);
    audioRef.current?.play().catch(() => {});
  };

  return (
    <main className="inv">
      <audio ref={audioRef} src={config.music} loop />
      {showOverlay && <Overlay onDismiss={handleDismiss} />}
      <Hero
        heroRef={heroRef}
        heroTextRef={heroTextRef}
        heroImgWrapRef={heroImgWrapRef}
      />
      <Welcome />
      <Countdown />
      <ImageBand src={config.images.bands[0]} gsapId="img-1" />
      <Program />
      <div className="inv__divider" />
      <RsvpForm />
      <div className="inv__divider" />
      <ImageBand src={config.images.bands[1]} />
      <Location />
      <div className="inv__divider" />
      <Footer />
    </main>
  );
}
