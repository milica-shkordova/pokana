import { useInvitation } from "../../engine/runtime";
import { useFooter } from "../../engine/hooks";
import { OptionalText } from "../../engine/components";
import st from "../Template.module.scss";

export default function Footer() {
  const { t, event } = useInvitation();
  const f = useFooter();
  const one = t(event.content.partnerOne);
  const two = t(event.content.partnerTwo);
  return (
    <footer className={st["inv__footer"]}>
      <p className={st["inv__footer-text"]}>{f.text}</p>
      <p className={st["inv__footer-names"]}>{one && two ? `${one} & ${two}` : f.names}</p>
      <OptionalText as="p" className={st["inv__footer-text"]}>
        {f.contact}
      </OptionalText>
      <p className={st["inv__footer-heart"]}>&#9825;</p>
    </footer>
  );
}
