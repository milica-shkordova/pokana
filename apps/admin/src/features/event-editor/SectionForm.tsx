import type { SectionKind } from "@pokanito/shared";
import type { FormProps } from "./context";
import { InfoForm, LocationForm, PeopleForm, ProgramForm } from "./ListSectionForms";
import { GalleryForm, MusicForm } from "./MediaSectionForms";
import RsvpForm from "./RsvpForm";
import { CountdownForm, FooterForm, GodparentsForm, WelcomeForm } from "./TextSectionForms";

/** The form for one invitation section. */
export function SectionForm(props: FormProps & { section: SectionKind; label: string }) {
  switch (props.section) {
    case "welcome":
      return <WelcomeForm {...props} />;
    case "countdown":
      return <CountdownForm {...props} />;
    case "program":
      return <ProgramForm {...props} />;
    case "info":
      return <InfoForm {...props} />;
    case "people":
      return <PeopleForm {...props} />;
    case "godparents":
      return <GodparentsForm {...props} />;
    case "gallery":
      return <GalleryForm {...props} />;
    case "rsvp":
      return <RsvpForm {...props} />;
    case "location":
      return <LocationForm {...props} />;
    case "music":
      return <MusicForm {...props} />;
    case "footer":
      return <FooterForm {...props} />;
  }
}
