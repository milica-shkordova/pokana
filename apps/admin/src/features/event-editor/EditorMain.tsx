import type { EventDetail, SectionState } from "@pokanito/shared";
import { Alert, errorMessage } from "@pokanito/ui";
import BasicsForm from "./BasicsForm";
import ClientForm from "./ClientForm";
import type { FormProps } from "./context";
import PhotosForm from "./PhotosForm";
import RepliesPanel from "./RepliesPanel";
import SectionPane from "./SectionPane";
import ThemeForm from "./ThemeForm";
import type { EventEditor } from "./useEventEditor";

/** The editor column: every pane (card) stacked, in sidebar order. */
export default function EditorMain({
  draft,
  formProps,
  sections,
  editor,
}: {
  draft: EventDetail;
  formProps: FormProps;
  sections: SectionState[];
  editor: Pick<EventEditor, "saveState" | "saveError" | "applyServer" | "save" | "update">;
}) {
  const setSections = (next: SectionState[]) => editor.update({ sections: next });
  return (
    <main className="admin-editor__main" id="main">
      {editor.saveState === "error" && <Alert tone="danger">Couldn&apos;t save: {errorMessage(editor.saveError)}</Alert>}
      {draft.isDefaults && (
        <Alert tone="info">
          You&apos;re editing the defaults of <strong>{draft.templateName}</strong>. Every new event made from this template starts as a copy of
          what you set here. Changes save automatically and don&apos;t affect existing events.
        </Alert>
      )}
      <div id="pane-basics" className="admin-editor__pane">
        <BasicsForm {...formProps} applyServer={editor.applyServer} flush={editor.save} />
      </div>
      <div id="pane-photos" className="admin-editor__pane">
        <PhotosForm {...formProps} />
      </div>
      {sections.map((s, i) => (
        <SectionPane key={s.id} formProps={formProps} sections={sections} index={i} onSections={setSections} />
      ))}
      <div id="pane-theme" className="admin-editor__pane">
        <ThemeForm {...formProps} />
      </div>
      {!draft.isDefaults && (
        <>
          <div id="pane-client" className="admin-editor__pane">
            <ClientForm {...formProps} />
          </div>
          <div id="pane-replies" className="admin-editor__pane">
            <RepliesPanel event={draft} />
          </div>
        </>
      )}
    </main>
  );
}
