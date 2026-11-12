import {
  mapsLink,
  moveItem,
  newId,
  venueMapsQuery,
  type InfoItem,
  type Person,
  type ProgramItem,
  type Venue,
} from "@pokanito/shared";
import { Button, Field, FormGrid, Input, IconPlus } from "@pokanito/ui";
import { EditorCard, LocalizedField, LocalizedInline, RowControls } from "./fields";
import { setContent, type SectionFormProps } from "./context";

export function ProgramForm({ event, languages, updateContent, label }: SectionFormProps) {
  const p = event.content.program ?? { items: [] };
  const set = (items: ProgramItem[]) => setContent(updateContent, "program")({ ...p, items });
  const patch = (i: number, item: Partial<ProgramItem>) => set(p.items.map((x, j) => (j === i ? { ...x, ...item } : x)));
  return (
    <EditorCard
      title={label}
      aside={
        <Button size="sm" variant="secondary" iconLeft={<IconPlus />} onClick={() => set([...p.items, { id: newId(), time: "", title: {} }])}>
          Add item
        </Button>
      }
    >
      <FormGrid>
        <LocalizedField
          label="Section heading"
          value={p.heading}
          languages={languages}
          onChange={(v) => setContent(updateContent, "program")({ ...p, heading: v })}
        />
      </FormGrid>
      <div className="admin-rows">
        {p.items.length === 0 && <p className="ui-muted">No items yet.</p>}
        {p.items.map((item, i) => (
          <div className="admin-program-row" key={item.id}>
            <input
              className="ui-input admin-program-row__time"
              aria-label={`Time, item ${i + 1}`}
              placeholder="16:00"
              value={item.time}
              onChange={(e) => patch(i, { time: e.target.value })}
            />
            <LocalizedInline label={`Description, item ${i + 1}`} placeholder="Description" value={item.title} languages={languages} onChange={(v) => patch(i, { title: v })} />
            <LocalizedInline label={`Place, item ${i + 1}`} placeholder="Place (optional)" value={item.place} languages={languages} onChange={(v) => patch(i, { place: v })} />
            <RowControls index={i} count={p.items.length} label={`item ${i + 1}`} onMove={(a, b) => set(moveItem(p.items, a, b))} onRemove={() => set(p.items.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
    </EditorCard>
  );
}

export function InfoForm({ event, languages, updateContent, label }: SectionFormProps) {
  const info = event.content.info ?? { items: [] };
  const set = (items: InfoItem[]) => setContent(updateContent, "info")({ ...info, items });
  const patch = (i: number, item: Partial<InfoItem>) => set(info.items.map((x, j) => (j === i ? { ...x, ...item } : x)));
  return (
    <EditorCard
      title={label}
      aside={
        <Button size="sm" variant="secondary" iconLeft={<IconPlus />} onClick={() => set([...info.items, { id: newId(), label: {}, title: {} }])}>
          Add card
        </Button>
      }
    >
      <FormGrid>
        <LocalizedField label="Section heading" value={info.heading} languages={languages} onChange={(v) => setContent(updateContent, "info")({ ...info, heading: v })} />
      </FormGrid>
      {info.items.map((item, i) => (
        <div className="admin-subcard" key={item.id}>
          <div className="admin-subcard__head">
            <strong>Card {i + 1}</strong>
            <RowControls index={i} count={info.items.length} label={`card ${i + 1}`} onMove={(a, b) => set(moveItem(info.items, a, b))} onRemove={() => set(info.items.filter((_, j) => j !== i))} />
          </div>
          <FormGrid>
            <LocalizedField label="Label" placeholder="DRESS CODE" value={item.label} languages={languages} onChange={(v) => patch(i, { label: v })} />
            <LocalizedField label="Title" placeholder="Black & Gold" value={item.title} languages={languages} onChange={(v) => patch(i, { title: v })} />
            <LocalizedField label="Text" value={item.text} languages={languages} onChange={(v) => patch(i, { text: v })} />
          </FormGrid>
        </div>
      ))}
    </EditorCard>
  );
}

export function PeopleForm({ event, languages, updateContent, label, mediaById, pick }: SectionFormProps) {
  const people = event.content.people ?? { items: [] };
  const set = (items: Person[]) => setContent(updateContent, "people")({ ...people, items });
  const patch = (i: number, item: Partial<Person>) => set(people.items.map((x, j) => (j === i ? { ...x, ...item } : x)));
  return (
    <EditorCard
      title={label}
      aside={
        <Button size="sm" variant="secondary" iconLeft={<IconPlus />} onClick={() => set([...people.items, { id: newId(), name: {} }])}>
          Add person
        </Button>
      }
    >
      <FormGrid>
        <LocalizedField label="Section heading" value={people.heading} languages={languages} onChange={(v) => setContent(updateContent, "people")({ ...people, heading: v })} />
      </FormGrid>
      {people.items.map((person, i) => {
        const photo = mediaById(person.photo);
        return (
          <div className="admin-subcard admin-person" key={person.id}>
            <button
              type="button"
              className="admin-person__photo"
              aria-label={photo ? `Change photo of person ${i + 1}` : `Add photo for person ${i + 1}`}
              onClick={() => pick("photo", (m) => patch(i, { photo: m.id }))}
            >
              {photo ? <img src={photo.thumbUrl} alt="" /> : <span>+ Photo</span>}
            </button>
            <FormGrid>
              <LocalizedField label="Name" value={person.name} languages={languages} onChange={(v) => patch(i, { name: v })} />
              <LocalizedField label="Role" value={person.role} languages={languages} onChange={(v) => patch(i, { role: v })} />
            </FormGrid>
            <div className="ui-stack--8">
              <RowControls index={i} count={people.items.length} label={`person ${i + 1}`} onMove={(a, b) => set(moveItem(people.items, a, b))} onRemove={() => set(people.items.filter((_, j) => j !== i))} />
              {photo && (
                <Button size="sm" variant="ghost" onClick={() => patch(i, { photo: null })}>
                  Remove photo
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </EditorCard>
  );
}

export function LocationForm({ event, languages, updateContent, label }: SectionFormProps) {
  const loc = event.content.location ?? { venues: [] };
  const set = (venues: Venue[]) => setContent(updateContent, "location")({ ...loc, venues });
  const patch = (i: number, v: Partial<Venue>) => set(loc.venues.map((x, j) => (j === i ? { ...x, ...v } : x)));
  return (
    <EditorCard
      title={label}
      aside={
        <Button size="sm" variant="secondary" iconLeft={<IconPlus />} onClick={() => set([...loc.venues, { id: newId(), name: {}, address: {}, mapsQuery: "" }])}>
          Add venue
        </Button>
      }
    >
      <FormGrid>
        <LocalizedField label="Section heading" value={loc.heading} languages={languages} onChange={(v) => setContent(updateContent, "location")({ ...loc, heading: v })} />
      </FormGrid>
      {loc.venues.map((v, i) => (
        <div className="admin-subcard" key={v.id}>
          <div className="admin-subcard__head">
            <strong>Venue {i + 1}</strong>
            <RowControls index={i} count={loc.venues.length} label={`venue ${i + 1}`} onMove={(a, b) => set(moveItem(loc.venues, a, b))} onRemove={() => set(loc.venues.filter((_, j) => j !== i))} />
          </div>
          <FormGrid>
            <LocalizedField label="Name" value={v.name} languages={languages} onChange={(x) => patch(i, { name: x })} />
            <LocalizedField label="Address" value={v.address} languages={languages} onChange={(x) => patch(i, { address: x })} />
            {loc.venues.length > 1 && (
              <LocalizedField label="Button label" placeholder="До црквата" value={v.label} languages={languages} onChange={(x) => patch(i, { label: x })} />
            )}
            <Field label="Map search" hint="What to search on Google Maps. Defaults to name + address.">
              <Input value={v.mapsQuery} onChange={(e) => patch(i, { mapsQuery: e.target.value })} />
            </Field>
            <LocalizedField label="Note" placeholder="Free parking for guests" value={v.note} languages={languages} onChange={(x) => patch(i, { note: x })} />
          </FormGrid>
          {(v.mapsQuery || v.name.mk || v.name.en) && (
            <a
              className="admin-link-strong"
              href={mapsLink(venueMapsQuery(v, (x) => x.mk ?? x.en ?? ""))}
              target="_blank"
              rel="noreferrer"
            >
              Check on Google Maps ↗
            </a>
          )}
        </div>
      ))}
    </EditorCard>
  );
}
