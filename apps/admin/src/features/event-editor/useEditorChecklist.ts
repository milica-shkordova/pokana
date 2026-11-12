import { useMemo } from "react";
import type { EventDetail, SectionState } from "@pokanito/shared";
import { getPublishChecklist, resolveSections, type TemplateDefinition } from "@pokanito/templates/definitions";

/** The event's sections in order (with the layout's defaults) and the publish checklist. */
export function useEditorChecklist(draft: EventDetail | null, def: TemplateDefinition | undefined) {
  const sections: SectionState[] = useMemo(() => (draft && def ? resolveSections(def, draft.sections) : []), [draft, def]);
  const checklist = useMemo(
    () =>
      draft && def
        ? getPublishChecklist(
            {
              name: draft.name,
              eventDate: draft.eventDate,
              languages: draft.languages,
              content: draft.content,
              sections,
              rsvpEmails: draft.rsvpEmails,
              rsvpTestedAt: draft.rsvpTestedAt,
              rsvpDeadline: draft.rsvpDeadline,
              clientApproved: draft.clientApproved,
            },
            def,
          )
        : [],
    [draft, def, sections],
  );
  const ready = checklist.every((c) => c.ok);
  return { sections, checklist, ready };
}
