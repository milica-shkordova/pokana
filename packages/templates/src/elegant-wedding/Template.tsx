import { useInvitation } from "../engine/runtime";
import { Photo } from "../engine/components";
import { TemplateShell } from "../engine/TemplateShell";
import Overlay from "./components/Overlay";
import Hero from "./components/Hero";
import Welcome from "./components/Welcome";
import Countdown from "./components/Countdown";
import Program from "./components/Program";
import RsvpForm from "./components/RsvpForm";
import Location from "./components/Location";
import Footer from "./components/Footer";
import { useElegantIntro } from "./useElegantIntro";
import st from "./Template.module.scss";

/** Photo bands sit between sections at fixed spots of the design. */
function Band({ slot, gsapId }: { slot: string; gsapId?: string }) {
  const { photo, preview } = useInvitation();
  if (!photo(slot) && !preview) return null;
  return (
    <div className={st["inv__hero-image-wrap"]} data-gsap={gsapId}>
      <Photo slot={slot} className={st["inv__hero-img"]} />
      <div className={st["inv__hero-img-overlay"]} />
      <div className={st["inv__hero-img-fade"]} />
    </div>
  );
}

const Divider = () => <div className={st["inv__divider"]} />;

/**
 * Elegant Wedding — the original live template. Hand-tuned GSAP
 * choreography and the tap-to-open splash (which also starts the music).
 */
export default function ElegantWedding() {
  const { showOverlay, dismiss, heroRefs } = useElegantIntro();
  return (
    <TemplateShell
      classes={{ phone: st.inv }}
      splash={showOverlay && <Overlay onDismiss={dismiss} />}
      hideMusic={showOverlay}
      hero={<Hero {...heroRefs} />}
      sections={{
        welcome: () => <Welcome />,
        countdown: () => (
          <>
            <Countdown />
            <Band slot="mid" gsapId="img-1" />
          </>
        ),
        program: () => (
          <>
            <Program />
            <Divider />
          </>
        ),
        rsvp: () => (
          <>
            <RsvpForm />
            <Divider />
          </>
        ),
        location: () => (
          <>
            <Band slot="beforeLocation" />
            <Location />
            <Divider />
          </>
        ),
        footer: () => <Footer />,
      }}
    />
  );
}
