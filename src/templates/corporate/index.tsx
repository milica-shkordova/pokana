import { useRef } from "react";
import { CorporateConfig } from "./types";
import { useScrollReveal } from "../shared/useScrollReveal";
import Hero from "./components/Hero";
import About from "./components/About";
import Agenda from "./components/Agenda";
import Footer from "./components/Footer";
import Countdown from "../shared/Countdown";
import ImageBand from "../shared/ImageBand";
import RsvpForm from "../shared/RsvpForm";
import Location from "../shared/Location";

const CONFETTI_COLORS = ["#b8863a", "#1c2430", "#8a99a8", "#d9c9a3"];

interface Props {
  config: CorporateConfig;
  clientSlug: string;
}

export default function CorporateTemplate({ config, clientSlug }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  useScrollReveal(rootRef);

  return (
    <main className="tpl-page corp" ref={rootRef}>
      <Hero config={config} />
      <Countdown
        targetDate={config.eventDate}
        label="Event starts in:"
        doneLabel="The event is underway."
        confettiColors={CONFETTI_COLORS}
      />
      <About config={config} />
      <Agenda config={config} />
      {config.images.bands[0] && <ImageBand src={config.images.bands[0]} />}
      <RsvpForm
        clientSlug={clientSlug}
        eventLabel={config.eventName}
        title="Register"
        deadlineText={
          config.registrationDeadline
            ? `Please register by ${config.registrationDeadline}`
            : undefined
        }
        attendingLabel="I'll attend"
        notAttendingLabel="Can't attend"
        showGuestCount={false}
        notesPlaceholder="Dietary requirements or notes"
        submitLabel="Register"
      />
      <Location label="Venue" {...config.venue} />
      <Footer config={config} />
    </main>
  );
}
