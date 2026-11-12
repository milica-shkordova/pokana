import type { TemplateDefinition } from "@pokanito/templates/definitions";
import { Chips, ToggleChip, cx } from "@pokanito/ui";
import type { TemplatePanelState } from "./useTemplatePanel";

/** Default palette, sections included and photo slots of an implemented layout. */
export default function TemplateDefaultsEditor({ def, panel }: { def: TemplateDefinition; panel: TemplatePanelState }) {
  const { theme, editingColour, editing, toggleEditingColour, setColour } = panel.palette;
  const { sections, toggleSection } = panel;
  return (
    <>
      <div className="ui-stack--8">
        <span className="ui-label">Default palette</span>
        <div className="ui-swatches">
          {def.themeOptions.map((o) => (
            <button
              key={o.key}
              type="button"
              className={cx("ui-swatch", editingColour === o.key && "ui-swatch--on")}
              style={{ background: theme[o.key] }}
              title={`${o.label}: ${theme[o.key]}`}
              aria-label={`${o.label} colour`}
              aria-pressed={editingColour === o.key}
              onClick={() => toggleEditingColour(o.key)}
            />
          ))}
          {!def.themeOptions.length && <span className="ui-muted">This layout has no colour options.</span>}
        </div>
        {editing && (
          <div className="admin-palette-edit">
            <span className="ui-muted">{editing.label}</span>
            <div className="ui-swatches">
              {[...new Set([editing.default, ...editing.options])].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cx("ui-swatch", theme[editing.key] === c && "ui-swatch--on")}
                  style={{ background: c }}
                  aria-label={c}
                  onClick={() => setColour(editing.key, c)}
                />
              ))}
              <label className="admin-colour" title="Custom colour">
                <input type="color" value={theme[editing.key]} onChange={(e) => setColour(editing.key, e.target.value)} />
                <span className="admin-colour__plus">+</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="ui-stack--8">
        <span className="ui-label">Sections included</span>
        <Chips>
          {sections.map((s) => {
            const sd = def.sections.find((x) => x.id === s.id);
            return (
              <ToggleChip
                key={s.id}
                pressed={s.enabled}
                disabled={sd?.required}
                title={sd?.required ? "Always included" : s.enabled ? "Click to leave out of new events" : "Click to include in new events"}
                onClick={() => toggleSection(s.id)}
              >
                {sd?.label ?? s.id}
              </ToggleChip>
            );
          })}
        </Chips>
        <span className="ui-muted">New events start with these on. Order and text are set in Edit defaults.</span>
      </div>

      <div className="ui-stack--8">
        <span className="ui-label">Photo slots</span>
        <span>{def.photoSlots.map((p) => `${p.label} (${p.aspect})`).join(" · ")}</span>
        <span className="ui-muted">Part of the {def.name} layout. Default photos are set in Edit defaults.</span>
      </div>
    </>
  );
}
