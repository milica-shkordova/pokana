import config from "@/config";

export default function Footer() {
  return (
    <footer className="inv__footer">
      <p className="inv__footer-text">Со нетрпение ве очекуваме</p>
      <p className="inv__footer-names">{config.bride} &amp; {config.groom}</p>
      <p className="inv__footer-heart">&#9825;</p>
    </footer>
  );
}
