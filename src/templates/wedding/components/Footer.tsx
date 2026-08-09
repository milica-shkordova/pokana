import { WeddingConfig } from "../types";

interface Props {
  config: WeddingConfig;
}

export default function Footer({ config }: Props) {
  return (
    <footer className="inv__footer">
      <p className="inv__footer-text">Со нетрпение ве очекуваме</p>
      <p className="inv__footer-names">
        {config.bride} &amp; {config.groom}
      </p>
      <p className="inv__footer-heart">&#9825;</p>
    </footer>
  );
}
