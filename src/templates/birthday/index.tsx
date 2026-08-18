import { useRef } from "react";
import { BirthdayConfig, BirthdayTheme } from "./types";
import { useScrollReveal } from "../shared/useScrollReveal";
import Hero from "./components/Hero";
import ThemeBanner from "./components/ThemeBanner";
import PartyDetails from "./components/PartyDetails";
import Footer from "./components/Footer";
import Countdown from "../shared/Countdown";
import ImageBand from "../shared/ImageBand";
import RsvpForm from "../shared/RsvpForm";
import Location from "../shared/Location";

const DEFAULT_CONFETTI = ["#ff8a65", "#ffca4a", "#4fc3a1", "#5fa8d3", "#e879a6"];
const THEME_CONFETTI: Record<BirthdayTheme, string[]> = {
  superhero: ["#e53935", "#1e88e5", "#fdd835", "#43a047"],
  princess: ["#f48fb1", "#ce93d8", "#fff59d", "#f8bbd0"],
};

interface Props {
  config: BirthdayConfig;
  clientSlug: string;
}

export default function BirthdayTemplate({ config, clientSlug }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  useScrollReveal(rootRef);

  const themeClass = config.theme ? ` bday--${config.theme}` : "";
  const confettiColors = config.theme ? THEME_CONFETTI[config.theme] : DEFAULT_CONFETTI;

  return (
    <main className={`tpl-page bday${themeClass}`} ref={rootRef}>
      <Hero config={config} />
      <ThemeBanner config={config} />
      <Countdown
        targetDate={config.partyDate}
        label="The countdown to the party:"
        doneLabel="The party has started! 🎉"
        confettiColors={confettiColors}
      />
      <PartyDetails config={config} />
      <ImageBand src={config.images.bands[0]} />
      <RsvpForm
        clientSlug={clientSlug}
        eventLabel={`${config.childName}'s Birthday`}
        title="RSVP"
        deadlineText={
          config.rsvpDeadline ? `Please RSVP by ${config.rsvpDeadline}` : undefined
        }
        notesPlaceholder="Allergies or anything we should know?"
      />
      {config.images.bands[1] && <ImageBand src={config.images.bands[1]} />}
      <Location label="Party location" {...config.venue} />
      <Footer config={config} />
    </main>
  );
}
