import { moveItem, type SectionState } from "@pokanito/shared";
import { Alert, Button, Switch, IconDown, IconUp } from "@pokanito/ui";
import type { FormProps } from "./context";
import { EditorCardSlot } from "./fields";
import { SectionForm } from "./SectionForm";

/**
 * One section's card in the editor column, with its reorder buttons, on/off
 * switch and the "section is off" notice injected via EditorCardSlot.
 */
export default function SectionPane({
  formProps,
  sections,
  index: i,
  onSections,
}: {
  formProps: FormProps;
  sections: SectionState[];
  index: number;
  onSections: (next: SectionState[]) => void;
}) {
  const s = sections[i];
  const meta = formProps.def.sections.find((d) => d.id === s.id);
  // The buttons are disabled at either end, so the move always stays in range.
  const moveBy = (d: -1 | 1) => onSections(moveItem(sections, i, i + d));
  const setOn = (on: boolean) => onSections(sections.map((x) => (x.id === s.id ? { ...x, enabled: on } : x)));
  return (
    <div id={`pane-${s.id}`} className="admin-editor__pane">
      <EditorCardSlot.Provider
        value={{
          muted: !s.enabled,
          actions: (
            <>
              <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => moveBy(-1)} aria-label={`Move ${meta?.label ?? s.id} up`}>
                <IconUp />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={i === sections.length - 1}
                onClick={() => moveBy(1)}
                aria-label={`Move ${meta?.label ?? s.id} down`}
              >
                <IconDown />
              </Button>
              <Switch
                checked={s.enabled}
                onChange={setOn}
                disabled={!!meta?.required}
                label={`${meta?.label ?? s.id} ${s.enabled ? "on" : "off"}`}
              />
            </>
          ),
          notice: !s.enabled ? (
            <Alert tone="warning">
              This section is off and won&apos;t show on the invitation.{" "}
              <Button variant="link" onClick={() => setOn(true)}>
                Turn it on
              </Button>
            </Alert>
          ) : null,
        }}
      >
        <SectionForm {...formProps} section={s.id} label={meta?.label ?? s.id} />
      </EditorCardSlot.Provider>
    </div>
  );
}
