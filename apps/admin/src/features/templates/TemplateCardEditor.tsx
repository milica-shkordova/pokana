import type { TemplateSummary } from "@pokanito/shared";
import { Button, Input } from "@pokanito/ui";
import type { TemplatePanelState } from "./useTemplatePanel";

/** The landing page card: its big word and colours. */
export default function TemplateCardEditor({ t, panel }: { t: TemplateSummary; panel: TemplatePanelState }) {
  const { style, patch } = panel;
  const { thumbLabel, setThumbLabel, saveThumbLabel } = panel.fields;
  return (
    <div className="ui-stack--8">
      <span className="ui-label">Card</span>
      <div className="admin-thumb-edit">
        <Input aria-label="Card word" value={thumbLabel} maxLength={24} onChange={(e) => setThumbLabel(e.target.value)} onBlur={saveThumbLabel} />
        <label className="admin-colour" title="Card background">
          <input type="color" value={style.bg} onChange={(e) => void patch({ thumbBg: e.target.value })} />
          <span style={{ background: style.bg }} />
        </label>
        <label className="admin-colour" title="Card text colour">
          <input type="color" value={style.ink} onChange={(e) => void patch({ thumbInk: e.target.value })} />
          <span style={{ background: style.ink }} />
        </label>
        {(t.thumb.bg || t.thumb.ink) && (
          <Button variant="link" onClick={() => void patch({ thumbBg: null, thumbInk: null })}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
