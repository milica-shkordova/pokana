import { ChristeningConfig } from "../types";

interface Props {
  config: ChristeningConfig;
}

export default function Footer({ config }: Props) {
  return (
    <footer className="christen__footer">
      <p className="christen__footer-text">With love,</p>
      <p className="christen__footer-name">{config.parentNames}</p>
      <p className="christen__footer-heart">&#9825;</p>
    </footer>
  );
}
