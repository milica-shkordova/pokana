import { useInvitation } from "../../engine/runtime";
import { useRsvpDeadlineText } from "../../engine/hooks";
import { useRsvpForm } from "../../engine/useRsvpForm";
import { cx } from "../../engine/format";
import st from "../Template.module.scss";

export default function RsvpForm() {
  const { t, s, event } = useInvitation();
  const f = useRsvpForm();
  const deadline = useRsvpDeadlineText();
  const heading = t(event.content.rsvp?.heading) || s.rsvpHeading;

  if (!f.open) {
    return (
      <section className={st["inv__section"]} data-gsap="rsvp">
        <h2 className={st["inv__label"]}>{heading}</h2>
        <p className={st["inv__sub-text"]}>{s.rsvpClosed}</p>
      </section>
    );
  }

  return (
    <section className={st["inv__section"]} data-gsap="rsvp">
      <h2 className={st["inv__label"]}>{heading}</h2>
      {deadline && <p className={st["inv__sub-text"]}>{deadline}</p>}
      <form className={st["inv__form"]} onSubmit={f.submit} noValidate>
        <div className={st["inv__attendance"]} role="radiogroup">
          <label className={cx(st["inv__attendance-option"], f.attending && st["inv__attendance-option--active"])}>
            <input type="radio" name="attendance" checked={f.attending} onChange={() => f.setAttending(true)} />
            {s.attending}
          </label>
          <label className={cx(st["inv__attendance-option"], !f.attending && st["inv__attendance-option--active"])}>
            <input type="radio" name="attendance" checked={!f.attending} onChange={() => f.setAttending(false)} />
            {s.notAttending}
          </label>
        </div>

        {(f.attending ? f.guests : f.guests.slice(0, 1)).map((guest) => {
          const multi = f.attending && f.guests.length > 1;
          return (
            <div
              key={guest.key}
              className={cx(st["inv__guest-row"], multi && st["inv__guest-row--multi"], guest.leaving && st["inv__guest-row--leaving"])}
            >
              {multi && (
                <button type="button" className={st["inv__guest-delete"]} onClick={() => f.removeGuest(guest.key)} aria-label={s.removeGuest}>
                  ×
                </button>
              )}
              <div className={st["inv__guest-name-row"]}>
                <input
                  className={st["inv__input"]}
                  type="text"
                  placeholder={s.namePlaceholder}
                  aria-label={s.name}
                  value={guest.name}
                  onChange={(e) => f.updateGuest(guest.key, { name: e.target.value })}
                />
              </div>
              {f.error(`guest-${guest.key}-name`) && <span className={st["inv__field-error"]}>{s.required}</span>}
              {f.attending && f.needsMenu && (
                <>
                  <div className={st["inv__select-wrap"]}>
                    <select
                      className={cx(st["inv__select"], guest.menu === "" && st["inv__select--empty"])}
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
                  {f.error(`guest-${guest.key}-menu`) && <span className={st["inv__field-error"]}>{s.required}</span>}
                </>
              )}
            </div>
          );
        })}

        {f.attending && (
          <button type="button" className={st["inv__add-guest"]} onClick={f.addGuest}>
            {s.addGuest}
          </button>
        )}

        {f.failed && <span className={st["inv__field-error"]}>{f.resultText}</span>}
        {f.sent && <p className={st["inv__form-success"]}>{f.resultText}</p>}

        <button className={st["inv__button"]} type="submit" disabled={f.sending}>
          {f.submitLabel}
        </button>
      </form>
    </section>
  );
}
