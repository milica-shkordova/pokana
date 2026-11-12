import { SECTIONS } from "./constants";

export default function SettingsNav({ active, onSelect }: { active: string | null; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="Settings sections" className="admin-settings__nav">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={() => onSelect(s.id)}
          className={
            active === s.id
              ? "admin-settings__link admin-settings__link--on"
              : "admin-settings__link"
          }
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
