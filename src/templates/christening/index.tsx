import { useRef } from "react";
import { ChristeningConfig } from "./types";
import { useScrollReveal } from "../shared/useScrollReveal";
import Hero from "./components/Hero";
import Welcome from "./components/Welcome";
import Program from "./components/Program";
import Footer from "./components/Footer";
import Countdown from "../shared/Countdown";
import ImageBand from "../shared/ImageBand";
import RsvpForm from "../shared/RsvpForm";
import Location from "../shared/Location";

const CONFETTI_COLORS = ["#8fb3c7", "#e2eef2", "#c9d9e0", "#a9c6d4"];

interface Props {
  config: ChristeningConfig;
  clientSlug: string;
}

export default function ChristeningTemplate({ config, clientSlug }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  useScrollReveal(rootRef);

  return (
    <main className="tpl-page christen" ref={rootRef}>
      <Hero config={config} />
      <Countdown
        targetDate={config.ceremonyDate}
        label="The ceremony begins in:"
        doneLabel="The ceremony has begun."
        confettiColors={CONFETTI_COLORS}
      />
      <Welcome config={config} />
      <Program config={config} />
      {config.images.bands[0] && <ImageBand src={config.images.bands[0]} />}
      <RsvpForm
        clientSlug={clientSlug}
        eventLabel={`${config.childName}'s Christening`}
        title="RSVP"
        deadlineText={
          config.rsvpDeadline ? `Please RSVP by ${config.rsvpDeadline}` : undefined
        }
        notesPlaceholder="Anything we should know?"
      />
      <Location label="Location" {...config.venue} />
      <Footer config={config} />
    </main>
  );
}
