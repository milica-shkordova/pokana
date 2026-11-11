import { Button, Swatches } from "@momentelo/ui";
import { EditorCard } from "./fields";
import type { FormProps } from "./context";

export default function ThemeForm({ event, def, update }: FormProps) {
  if (!def.themeOptions.length) {
    return (
      <EditorCard title="Theme">
        <p className="admin-muted">This template has a fixed palette.</p>
      </EditorCard>
    );
  }
  const set = (key: string, value: string) => update({ theme: { ...event.theme, [key]: value } });
  return (
    <EditorCard title="Theme" aside="Preset colours designed for this template">
      {def.themeOptions.map((o) => {
        const value = event.theme[o.key] ?? o.default;
        return (
          <div key={o.key} className="admin-stack-sm">
            <span className="ui-field__label">{o.label}</span>
            <div className="admin-row admin-row--wrap">
              <Swatches options={o.options} value={value} onChange={(v) => set(o.key, v)} label={o.label} size="lg" />
              <label className="admin-color">
                <span className="ui-sr-only">Custom {o.label} colour</span>
                <input type="color" value={value} onChange={(e) => set(o.key, e.target.value)} />
                <span className="admin-mono">{value}</span>
              </label>
              {value.toLowerCase() !== o.default.toLowerCase() && (
                <Button size="sm" variant="ghost" onClick={() => set(o.key, o.default)}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </EditorCard>
  );
}
