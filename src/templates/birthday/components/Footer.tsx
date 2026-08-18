import { BirthdayConfig } from "../types";

interface Props {
  config: BirthdayConfig;
}

export default function Footer({ config }: Props) {
  return (
    <footer className="bday__footer">
      <p className="bday__footer-text">Can&apos;t wait to celebrate with you!</p>
      <p className="bday__footer-name">{config.childName} 🎈</p>
    </footer>
  );
}
