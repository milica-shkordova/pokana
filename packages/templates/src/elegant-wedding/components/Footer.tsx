import { useInvitation } from "../../engine/runtime";

export default function Footer() {
  const { t, event } = useInvitation();
  const c = event.content;
  const one = t(c.partnerOne);
  const two = t(c.partnerTwo);
  return (
    <footer className="inv__footer">
      <p className="inv__footer-text">{t(c.footer?.text)}</p>
      <p className="inv__footer-names">{one && two ? `${one} & ${two}` : t(c.names)}</p>
      {t(c.footer?.contact) && <p className="inv__footer-text">{t(c.footer?.contact)}</p>}
      <p className="inv__footer-heart">&#9825;</p>
    </footer>
  );
}
