import { CATEGORY_LABELS, eventUrl, type TemplateSummary } from "@pokanito/shared";
import type { TemplateDefinition } from "@pokanito/templates/definitions";
import { Button, CategoryLabel } from "@pokanito/ui";
import PhoneThumb from "@/components/PhoneThumb";
import { thumbStyle } from "@/components/TemplateThumb";
import { WEB_URL } from "@/lib/api";

/** The selected template: big phone preview, what it includes, and "Use …". */
export default function TemplatePickPanel({
  pick,
  pickDef,
  creating,
  onCreate,
}: {
  pick: TemplateSummary;
  pickDef: TemplateDefinition | undefined;
  creating: string | null;
  onCreate: (id: string) => void;
}) {
  return (
    <aside className="admin-new__panel" aria-label="Selected template">
      <div className="admin-new__stage" key={pick.id} style={{ background: thumbStyle(pick).bg }}>
        <PhoneThumb t={pick} size="lg" />
        {pick.demoSlug && (
          <a className="admin-new__demo" href={eventUrl(WEB_URL, pick.demoSlug)} target="_blank" rel="noreferrer">
            Open live demo ↗
          </a>
        )}
      </div>
      <div className="admin-new__info" key={`${pick.id}-info`}>
        <CategoryLabel>{CATEGORY_LABELS[pick.category].one}</CategoryLabel>
        <h2 className="admin-new__name">{pick.name}</h2>
        <p className="ui-muted">{pick.description}</p>
        {pickDef && (
          <ul className="admin-new__facts">
            <li>{pickDef.sections.length} sections</li>
            <li>
              {pickDef.photoSlots.length} photo slot{pickDef.photoSlots.length === 1 ? "" : "s"}
            </li>
            <li>MK / EN</li>
          </ul>
        )}
        <Button block size="lg" loading={creating === pick.id} disabled={!!creating} onClick={() => onCreate(pick.id)}>
          Use {pick.name} →
        </Button>
        <p className="ui-muted admin-new__note">
          Opens the editor with this template’s defaults. You can switch template later; your content carries over.
        </p>
      </div>
    </aside>
  );
}
