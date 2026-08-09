import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "@components/landing/Hero";
import WhatWeDo from "@components/landing/WhatWeDo";
import TemplateGallery from "@components/landing/TemplateGallery";
import HowItWorks from "@components/landing/HowItWorks";
import ContactSection from "@components/landing/ContactSection";
import Footer from "@components/landing/Footer";

export default function InvyLanding() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // Card grids get a bouncier, staggered pop-in as a group.
      const groups = gsap.utils.toArray<Element>(
        ".landing__features, .landing__gallery, .landing__steps",
      );
      groups.forEach((group) => {
        const items = group.querySelectorAll("[data-reveal]");
        if (!items.length) return;
        gsap.fromTo(
          items,
          { opacity: 0, y: 32, scale: 0.94, rotate: -1.5 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.6,
            ease: "back.out(1.6)",
            stagger: 0.12,
            scrollTrigger: {
              trigger: group,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // Everything else (headings, hero, contact block) gets a simple fade-up.
      const singles = gsap.utils.toArray<Element>("[data-reveal]").filter(
        (el) => !el.closest(".landing__features, .landing__gallery, .landing__steps"),
      );
      singles.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="landing">
      <Hero />
      <WhatWeDo />
      <TemplateGallery />
      <HowItWorks />
      <ContactSection />
      <Footer />
    </main>
  );
}
