import { BirthdayConfig, BirthdayTheme } from "../types";

const THEME_COPY: Record<BirthdayTheme, { icon: string; label: string }> = {
  superhero: { icon: "🦸", label: "Superhero artwork goes here" },
  princess: { icon: "👑", label: "Princess artwork goes here" },
};

interface Props {
  config: BirthdayConfig;
}

// Shows the theme's real artwork once config.images.themeArt is supplied;
// until then, a clearly-labeled placeholder marks where it'll go.
export default function ThemeBanner({ config }: Props) {
  if (!config.theme) return null;
  const copy = THEME_COPY[config.theme];

  return (
    <div className="bday__theme-banner" data-reveal>
      {config.images.themeArt ? (
        <img className="bday__theme-banner-img" src={config.images.themeArt} alt="" />
      ) : (
        <div className="bday__theme-banner-placeholder">
          <span className="bday__theme-banner-icon">{copy.icon}</span>
          <span className="bday__theme-banner-text">{copy.label}</span>
        </div>
      )}
    </div>
  );
}
