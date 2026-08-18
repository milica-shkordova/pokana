import { CorporateConfig } from "../types";

interface Props {
  config: CorporateConfig;
}

export default function Footer({ config }: Props) {
  return (
    <footer className="corp__footer">
      <p className="corp__footer-text">We look forward to seeing you there.</p>
      <p className="corp__footer-name">{config.eventName}</p>
    </footer>
  );
}
