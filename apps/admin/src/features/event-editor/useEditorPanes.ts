import { useCallback } from "react";
import { useScrollSpy } from "@pokanito/ui";
import { PANE_SPY_OFFSET } from "./constants";
import type { Pane } from "./types";

/**
 * All panes are stacked in one column: the sidebar scrolls to a card, and
 * the highlighted item follows whichever card is in view (the last ones
 * too, once the page is scrolled to the bottom).
 */
export function useEditorPanes(hasDraft: boolean, storedSections: unknown) {
  const [activePane, selectPane] = useScrollSpy(".admin-editor__pane", {
    enabled: hasDraft,
    offset: PANE_SPY_OFFSET,
    deps: JSON.stringify(storedSections),
  });
  const pane = ((activePane || "pane-basics").replace(/^pane-/, "") as Pane);
  const goToPane = useCallback(
    (p: Pane) => {
      selectPane(`pane-${p}`);
      document.getElementById(`pane-${p}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [selectPane],
  );
  return { pane, goToPane };
}
