import type { TemplateCategory } from "@pokanito/shared";
import { fmt } from "@/content/landing";
import { useLang } from "../i18n";
import type { Filter } from "./types";

/** "No templates here (yet)": shown when the active tab has no live template. */
export default function EmptyText({ filter, hasSoon }: { filter: Filter; hasSoon: boolean }) {
  const tt = useLang().t.templates;
  return (
    <p className="lp-empty">
      {filter === "all"
        ? tt.empty.all
        : fmt(tt.empty.category, { category: tt.categories[filter as TemplateCategory].one.toLowerCase() })}
      {hasSoon ? tt.empty.soon : tt.empty.end}
    </p>
  );
}
