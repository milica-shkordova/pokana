import {
  newId,
  utcToZoned,
  zonedToUtc,
  type InfoItem,
  type Person,
  type ProgramItem,
  type SectionKind,
  type Venue,
} from "@momentelo/shared";
import { Button, Checkbox, Field, FormGrid, Input } from "@momentelo/ui";
import { IconMusic, IconPlus } from "../Icons";
import { UploadButton } from "../MediaPicker";
import { formatDuration } from "@/lib/format";
import { EditorCard, LocalizedField, LocalizedInline, RowControls, move } from "./fields";
import { setContent, type FormProps } from "./context";

const RSVP_MODE_LABELS: Record<string, string> = {
  "guests-with-menu": "One row per guest, with a menu choice",
  "guest-count": "Name + number of guests",
  kids: "Child's name, number of children and adults, allergies",
  "plus-one": "Name + plus one",
  registration: "Name, company, work email, staying for dinner",
};

export function SectionForm(props: FormProps & { section: SectionKind; label: string }) {
  switch (props.section) {
    case "welcome":
      return <WelcomeForm {...props} />;
    case "countdown":
      return <CountdownForm {...props} />;
    case "program":
      return <ProgramForm {...props} />;
    case "info":
      return <InfoForm {...props} />;
    case "people":
      return <PeopleForm {...props} />;
    case "godparents":
      return <GodparentsForm {...props} />;
    case "gallery":
      return <GalleryForm {...props} />;
    case "rsvp":
      return <RsvpForm {...props} />;
    case "location":
      return <LocationForm {...props} />;
    case "music":
      return <MusicForm {...props} />;
    case "footer":
      return <FooterForm {...props} />;
  }
}

type P = FormProps & { label: string };

function WelcomeForm({ event, languages, updateContent, label }: P) {
  const w = event.content.welcome ?? { text: {} };
  const set = setContent(updateContent, "welcome");
  return (
    <EditorCard title={label} aside="The personal note under the hero">
      <FormGrid>
        <LocalizedField label="Heading" value={w.heading} languages={languages} onChange={(v) => set({ ...w, heading: v })} />
        <LocalizedField
          label="Text"
          value={w.text}
          languages={languages}
          multiline
          rows={6}
          hint="A blank line starts a new paragraph."
          onChange={(v) => set({ ...w, text: v })}
        />
        <LocalizedField label="Signature" value={w.signature} languages={languages} onChange={(v) => set({ ...w, signature: v })} />
      </FormGrid>
    </EditorCard>
  );
}

function CountdownForm({ event, languages, updateContent, label }: P) {
  const cd = event.content.countdown ?? {};
  return (
    <EditorCard title={label} aside="Counts down to the event date & time in Basics">
      <FormGrid>
        <LocalizedField
          label="Heading"
          value={cd.heading}
          languages={languages}
          onChange={(v) => setContent(updateContent, "countdown")({ ...cd, heading: v })}
        />
      </FormGrid>
    </EditorCard>
  );
}

function ProgramForm({ event, languages, updateContent, label }: P) {
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
        {p.items.length === 0 && <p className="admin-muted">No items yet.</p>}
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
            <RowControls index={i} count={p.items.length} label={`item ${i + 1}`} onMove={(a, b) => set(move(p.items, a, b))} onRemove={() => set(p.items.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
    </EditorCard>
  );
}

function InfoForm({ event, languages, updateContent, label }: P) {
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
            <RowControls index={i} count={info.items.length} label={`card ${i + 1}`} onMove={(a, b) => set(move(info.items, a, b))} onRemove={() => set(info.items.filter((_, j) => j !== i))} />
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

function PeopleForm({ event, languages, updateContent, label, mediaById, pick }: P) {
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
            <div className="admin-stack-sm">
              <RowControls index={i} count={people.items.length} label={`person ${i + 1}`} onMove={(a, b) => set(move(people.items, a, b))} onRemove={() => set(people.items.filter((_, j) => j !== i))} />
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

function GodparentsForm({ event, languages, updateContent, label }: P) {
  const g = event.content.godparents ?? { names: {} };
  const set = setContent(updateContent, "godparents");
  return (
    <EditorCard title={label} aside="Кумови">
      <FormGrid>
        <LocalizedField label="Heading" value={g.heading} languages={languages} onChange={(v) => set({ ...g, heading: v })} />
        <LocalizedField label="Names" value={g.names} languages={languages} onChange={(v) => set({ ...g, names: v })} />
      </FormGrid>
    </EditorCard>
  );
}

function GalleryForm({ event, languages, updateContent, label, mediaById, pick, addToLibrary }: P) {
  const g = event.content.gallery ?? { photos: [] };
  const set = (photos: string[]) => setContent(updateContent, "gallery")({ ...g, photos });
  return (
    <EditorCard
      title={label}
      aside={
        <div className="admin-row">
          <UploadButton
            eventId={event.id}
            size="sm"
            onUploaded={(items) => {
              addToLibrary(items);
              set([...g.photos, ...items.filter((m) => m.kind === "photo").map((m) => m.id)]);
            }}
          />
          <Button size="sm" variant="secondary" onClick={() => pick("photo", (m) => set([...g.photos, m.id]), "Add to gallery")}>
            Choose from library
          </Button>
        </div>
      }
    >
      <FormGrid>
        <LocalizedField label="Heading" value={g.heading} languages={languages} onChange={(v) => setContent(updateContent, "gallery")({ ...g, heading: v })} />
      </FormGrid>
      <div className="admin-photo-grid">
        {g.photos.map((id, i) => {
          const m = mediaById(id);
          return (
            <figure key={`${id}-${i}`} className="admin-photo">
              <div className="admin-photo__frame" style={{ aspectRatio: "1" }}>
                {m ? <img src={m.thumbUrl} alt={m.alt} /> : <span className="admin-muted">Missing file</span>}
              </div>
              <RowControls index={i} count={g.photos.length} label={`photo ${i + 1}`} onMove={(a, b) => set(move(g.photos, a, b))} onRemove={() => set(g.photos.filter((_, j) => j !== i))} />
            </figure>
          );
        })}
      </div>
      {g.photos.length === 0 && <p className="admin-muted">No gallery photos yet.</p>}
    </EditorCard>
  );
}

function RsvpForm({ event, languages, updateContent, update, label, def }: P) {
  const r = event.content.rsvp ?? { mode: def.rsvpMode, menuOptions: [], askAllergies: false, askMessage: false };
  const set = setContent(updateContent, "rsvp");
  const deadline = event.rsvpDeadline ? utcToZoned(event.rsvpDeadline).date : "";
  return (
    <EditorCard title={label} aside={RSVP_MODE_LABELS[r.mode]}>
      <FormGrid>
        <LocalizedField label="Heading" value={r.heading} languages={languages} onChange={(v) => set({ ...r, heading: v })} />
        <LocalizedField label="Note under the heading" value={r.note} languages={languages} onChange={(v) => set({ ...r, note: v })} />
        <Field label="Reply by" hint="After this day the form shows a closed message">
          <Input type="date" value={deadline} onChange={(e) => update({ rsvpDeadline: e.target.value ? zonedToUtc(e.target.value, "00:00") : null })} />
        </Field>
        {(r.mode === "guests-with-menu" || r.menuOptions.length > 0) && (
          <Field label="Menu options" hint="Separated by commas. Leave empty to not ask.">
            <Input
              defaultValue={r.menuOptions.join(", ")}
              onBlur={(e) =>
                set({
                  ...r,
                  menuOptions: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
        )}
      </FormGrid>
      <div className="admin-row admin-row--wrap">
        <Checkbox label="Ask about allergies" checked={r.askAllergies || r.mode === "kids"} disabled={r.mode === "kids"} onChange={(e) => set({ ...r, askAllergies: e.target.checked })} />
        <Checkbox label="Let guests leave a message" checked={r.askMessage} onChange={(e) => set({ ...r, askMessage: e.target.checked })} />
      </div>
      <p className="admin-muted">Replies go to the addresses in Basics › “Send RSVP replies to”.</p>
    </EditorCard>
  );
}

function LocationForm({ event, languages, updateContent, label }: P) {
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
            <RowControls index={i} count={loc.venues.length} label={`venue ${i + 1}`} onMove={(a, b) => set(move(loc.venues, a, b))} onRemove={() => set(loc.venues.filter((_, j) => j !== i))} />
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
              href={`https://maps.google.com/?q=${encodeURIComponent(v.mapsQuery || [v.name.mk ?? v.name.en, v.address.mk ?? v.address.en].filter(Boolean).join(", "))}`}
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

function MusicForm({ event, updateContent, label, mediaById, pick, addToLibrary }: P) {
  const music = event.content.music ?? {};
  const track = mediaById(music.mediaId);
  const set = setContent(updateContent, "music");
  return (
    <EditorCard title={label} aside="Plays after the guest taps play (browsers block autoplay with sound)">
      {track ? (
        <div className="admin-music">
          <span className="admin-music__icon">
            <IconMusic size={22} />
          </span>
          <div className="admin-stack-sm" style={{ flex: 1, minWidth: 0 }}>
            <strong>{track.fileName.replace(/^seed:/, "")}</strong>
            <span className="admin-muted">{formatDuration(track.durationSec)}</span>
            <audio controls preload="none" src={track.url} style={{ width: "100%" }} />
          </div>
          <Button size="sm" variant="ghost" onClick={() => set({ ...music, mediaId: null })}>
            Remove
          </Button>
        </div>
      ) : (
        <p className="admin-muted">No music chosen.</p>
      )}
      <div className="admin-row">
        <UploadButton
          eventId={event.id}
          kind="audio"
          multiple={false}
          label="Upload MP3"
          onUploaded={(items) => {
            addToLibrary(items);
            if (items[0]) set({ ...music, mediaId: items[0].id });
          }}
        />
        <Button variant="secondary" onClick={() => pick("audio", (m) => set({ ...music, mediaId: m.id }))}>
          Choose from library
        </Button>
      </div>
    </EditorCard>
  );
}

function FooterForm({ event, languages, updateContent, label }: P) {
  const f = event.content.footer ?? {};
  const set = setContent(updateContent, "footer");
  return (
    <EditorCard title={label}>
      <FormGrid>
        <LocalizedField label="Closing line" value={f.text} languages={languages} onChange={(v) => set({ ...f, text: v })} />
        <LocalizedField label="Contact line" placeholder="мама Ивана · 070 123 456" value={f.contact} languages={languages} onChange={(v) => set({ ...f, contact: v })} />
      </FormGrid>
    </EditorCard>
  );
}
