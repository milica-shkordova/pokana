import { useInvitation } from "../../engine/runtime";
import { useRsvpDeadlineText } from "../../engine/hooks";
import { useRsvpForm } from "../../engine/useRsvpForm";

export default function RsvpForm() {
  const { t, s, event } = useInvitation();
  const f = useRsvpForm();
  const deadline = useRsvpDeadlineText();
  const heading = t(event.content.rsvp?.heading) || s.rsvpHeading;

  if (!f.open) {
    return (
      <section className="inv__section" data-gsap="rsvp">
        <h2 className="inv__label">{heading}</h2>
        <p className="inv__sub-text">{s.rsvpClosed}</p>
      </section>
    );
  }

  return (
    <section className="inv__section" data-gsap="rsvp">
      <h2 className="inv__label">{heading}</h2>
      {deadline && <p className="inv__sub-text">{deadline}</p>}
      <form className="inv__form" onSubmit={f.submit} noValidate>
        <div className="inv__attendance" role="radiogroup">
          <label className={`inv__attendance-option${f.attending ? " inv__attendance-option--active" : ""}`}>
            <input type="radio" name="attendance" checked={f.attending} onChange={() => f.setAttending(true)} />
            {s.attending}
          </label>
          <label className={`inv__attendance-option${!f.attending ? " inv__attendance-option--active" : ""}`}>
            <input type="radio" name="attendance" checked={!f.attending} onChange={() => f.setAttending(false)} />
            {s.notAttending}
          </label>
        </div>

        {(f.attending ? f.guests : f.guests.slice(0, 1)).map((guest) => {
          const multi = f.attending && f.guests.length > 1;
          return (
            <div
              key={guest.key}
              className={`inv__guest-row${multi ? " inv__guest-row--multi" : ""}${guest.leaving ? " inv__guest-row--leaving" : ""}`}
            >
              {multi && (
                <button type="button" className="inv__guest-delete" onClick={() => f.removeGuest(guest.key)} aria-label={s.removeGuest}>
                  ×
                </button>
              )}
              <div className="inv__guest-name-row">
                <input
                  className="inv__input"
                  type="text"
                  placeholder={s.namePlaceholder}
                  aria-label={s.name}
                  value={guest.name}
                  onChange={(e) => f.updateGuest(guest.key, { name: e.target.value })}
                />
              </div>
              {f.error(`guest-${guest.key}-name`) && <span className="inv__field-error">{s.required}</span>}
              {f.attending && f.needsMenu && (
                <>
                  <div className="inv__select-wrap">
                    <select
                      className={`inv__select${guest.menu === "" ? " inv__select--empty" : ""}`}
                      aria-label={s.menu}
                      value={guest.menu}
                      onChange={(e) => f.updateGuest(guest.key, { menu: e.target.value })}
                    >
                      <option value="" disabled>
                        {s.chooseMenu}
                      </option>
                      {f.menuOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  {f.error(`guest-${guest.key}-menu`) && <span className="inv__field-error">{s.required}</span>}
                </>
              )}
            </div>
          );
        })}

        {f.attending && (
          <button type="button" className="inv__add-guest" onClick={f.addGuest}>
            {s.addGuest}
          </button>
        )}

        {f.failed && <span className="inv__field-error">{f.resultText}</span>}
        {f.sent && <p className="inv__form-success">{f.resultText}</p>}

        <button className="inv__button" type="submit" disabled={f.sending}>
          {f.submitLabel}
        </button>
      </form>
    </section>
  );
}
