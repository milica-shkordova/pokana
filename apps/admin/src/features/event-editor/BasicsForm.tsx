import {
  LOCALE_LABELS,
  LOCALES,
  utcToZoned,
  zonedToUtc,
  type EventDetail,
} from "@pokanito/shared";
import {
  Field,
  FormGrid,
  Input,
  Select,
} from "@pokanito/ui";
import { EditorCard, LocalizedField } from "./fields";
import { setContent, type FormProps } from "./context";
import InvitationLinkField from "./InvitationLinkField";
import RsvpEmailsField from "./RsvpEmailsField";
import type { LangChoice } from "./types";
import { joinNames } from "./utils";

export default function BasicsForm(
  props: FormProps & {
    applyServer: (e: EventDetail) => void;
    flush: () => Promise<void>;
  },
) {
  const { event, def, languages, update, updateContent, applyServer, flush } =
    props;
  const c = event.content;
  const d = def.defaultContent;
  const set = <K extends keyof typeof c>(k: K) => setContent(updateContent, k);
  const zoned = utcToZoned(event.eventDate);

  const lang: LangChoice =
    languages.length > 1 ? "both" : (languages[0] as LangChoice);
  const setLang = (v: LangChoice) =>
    update({ languages: v === "both" ? [...LOCALES] : [v] });

  const isWedding = def.category === "wedding";

  return (
    <EditorCard
      title="Basics"
      aside="Shown in the header, countdown and link preview"
    >
      <FormGrid className="admin-basics-grid">
        {isWedding ? (
          <>
            <LocalizedField
              label="First name (bride)"
              value={c.partnerOne}
              languages={languages}
              onChange={(v) =>
                updateContent((cc) => ({
                  ...cc,
                  partnerOne: v,
                  names: joinNames(v, cc.partnerTwo, languages),
                }))
              }
            />
            <LocalizedField
              label="First name (groom)"
              value={c.partnerTwo}
              languages={languages}
              onChange={(v) =>
                updateContent((cc) => ({
                  ...cc,
                  partnerTwo: v,
                  names: joinNames(cc.partnerOne, v, languages),
                }))
              }
            />
          </>
        ) : (
          <LocalizedField
            label="Names / headline"
            value={c.names}
            languages={languages}
            onChange={set("names")}
          />
        )}
        <div className="admin-date-time">
          <Field label="Event date" hint="Skopje time">
            <Input
              type="date"
              value={zoned.date}
              onChange={(e) =>
                e.target.value &&
                update({ eventDate: zonedToUtc(e.target.value, zoned.time) })
              }
            />
          </Field>
          <Field label="Time">
            <Input
              type="time"
              value={zoned.time}
              onChange={(e) =>
                e.target.value &&
                update({ eventDate: zonedToUtc(zoned.date, e.target.value) })
              }
            />
          </Field>
        </div>
        <Field label="Language">
          <Select
            value={lang}
            onChange={(e) => setLang(e.target.value as LangChoice)}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_LABELS[l]}
              </option>
            ))}
            <option value="both">Both (toggle)</option>
          </Select>
        </Field>
        {d.eyebrow !== undefined && (
          <LocalizedField
            label="Line above the names"
            value={c.eyebrow}
            languages={languages}
            onChange={set("eyebrow")}
          />
        )}
        {d.tagline !== undefined && (
          <LocalizedField
            label="Tagline"
            value={c.tagline}
            languages={languages}
            onChange={set("tagline")}
            multiline
            rows={2}
          />
        )}
        {d.age !== undefined && (
          <Field label="Age">
            <Input
              type="number"
              min={0}
              max={150}
              value={c.age ?? ""}
              onChange={(e) =>
                updateContent((cc) => ({
                  ...cc,
                  age:
                    e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
            />
          </Field>
        )}
        {d.organizer !== undefined && (
          <LocalizedField
            label="Hosts / organizer"
            value={c.organizer}
            languages={languages}
            onChange={set("organizer")}
          />
        )}
        {d.city !== undefined && (
          <LocalizedField
            label="City"
            value={c.city}
            languages={languages}
            onChange={set("city")}
          />
        )}
      </FormGrid>

      {/* Template defaults have no link or client — those are set per event. */}
      {!event.isDefaults && (
        <>
          <InvitationLinkField event={event} update={update} />
          <RsvpEmailsField event={event} update={update} applyServer={applyServer} flush={flush} />
        </>
      )}
    </EditorCard>
  );
}
