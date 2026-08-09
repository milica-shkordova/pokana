import { useState } from "react";
import { WeddingConfig } from "../types";
import { getClientWeb3FormsKey, submitWeb3Form } from "@/lib/web3forms";

type Guest = { name: string; menu: string; leaving?: boolean };

interface Props {
  config: WeddingConfig;
  clientSlug: string;
}

export default function RsvpForm({ config, clientSlug }: Props) {
  const [attending, setAttending] = useState(true);
  const [guests, setGuests] = useState<Guest[]>([{ name: "", menu: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const updateGuest = (
    index: number,
    field: "name" | "menu",
    value: string,
  ) => {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  };

  const addGuest = () => {
    setGuests((prev) => [...prev, { name: "", menu: "" }]);
    setAttempted(false);
  };

  const removeGuest = (index: number) => {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, leaving: true } : g)),
    );
    setTimeout(() => {
      setGuests((prev) => prev.filter((g) => !g.leaving));
    }, 280);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (attending && guests.some((g) => !g.name || !g.menu)) return;
    if (!attending && !guests[0].name) return;
    setSubmitting(true);

    const coupleName = `${config.bride} & ${config.groom}`;
    const guestLines = attending
      ? guests.map((g) => `${g.name} — ${g.menu}`).join("\n")
      : `  ${guests[0].name} — За жал нема да може да присуствува`;
    const message = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `  RSVP — ${coupleName}`,
      `  ${config.weddingDateLabel} · ${config.venue.name}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      guestLines,
      "",
      attending ? `  Вкупно гости: ${guests.length}` : "  Нема да присуствува",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ].join("\n");

    await submitWeb3Form({
      access_key: getClientWeb3FormsKey(clientSlug),
      from_name: `Покана — ${coupleName}`,
      subject: attending
        ? `RSVP: ${guests[0].name} (${guests.length} ${guests.length === 1 ? "гостин" : "гости"})`
        : `RSVP: ${guests[0].name} — Нема да присуствува`,
      message,
    });

    setSubmitting(false);
    setSubmitted(true);
    setGuests([{ name: "", menu: "" }]);
    setAttempted(false);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="inv__section" data-gsap="rsvp">
      <p className="inv__label">Потврди присуство</p>
      <p className="inv__sub-text">
        Ве замолуваме да го потврдите вашето присуство најдоцна до{" "}
        {config.rsvpDeadline}
      </p>
      <form className="inv__form" onSubmit={handleSubmit}>
        <div className="inv__attendance">
          <label
            className={`inv__attendance-option${attending ? " inv__attendance-option--active" : ""}`}
          >
            <input
              type="radio"
              name="attendance"
              checked={attending}
              onChange={() => setAttending(true)}
            />
            Ќе присуствувам
          </label>
          <label
            className={`inv__attendance-option${!attending ? " inv__attendance-option--active" : ""}`}
          >
            <input
              type="radio"
              name="attendance"
              checked={!attending}
              onChange={() => {
                setAttending(false);
                setAttempted(false);
              }}
            />
            За жал нема да можам да присуствувам
          </label>
        </div>

        {!attending && (
          <div className="inv__guest-row">
            <div className="inv__guest-name-row">
              <input
                className="inv__input"
                type="text"
                placeholder="Внеси име и презиме"
                value={guests[0].name}
                onChange={(e) => updateGuest(0, "name", e.target.value)}
              />
            </div>
            {attempted && !guests[0].name && (
              <span className="inv__field-error">
                Пополнете го полето за да продолжите
              </span>
            )}
          </div>
        )}

        {attending && (
          <>
            {guests.map((guest, i) => (
              <div
                key={i}
                className={`inv__guest-row${guests.length > 1 ? " inv__guest-row--multi" : ""}${guest.leaving ? " inv__guest-row--leaving" : ""}`}
              >
                {guests.length > 1 && (
                  <button
                    type="button"
                    className="inv__guest-delete"
                    onClick={() => removeGuest(i)}
                    aria-label="Избриши гостин"
                  >
                    ×
                  </button>
                )}
                <div className="inv__guest-name-row">
                  <input
                    className="inv__input"
                    type="text"
                    placeholder="Внеси име и презиме"
                    value={guest.name}
                    onChange={(e) => updateGuest(i, "name", e.target.value)}
                  />
                </div>
                {attempted && !guest.name && (
                  <span className="inv__field-error">
                    Пополнете го полето за да продолжите
                  </span>
                )}
                <div className="inv__select-wrap">
                  <select
                    className={`inv__select${guest.menu === "" ? " inv__select--empty" : ""}`}
                    value={guest.menu}
                    onChange={(e) => updateGuest(i, "menu", e.target.value)}
                  >
                    <option value="" disabled>
                      Избери мени
                    </option>
                    <option value="Редовно">Регуларно</option>
                    <option value="Вегетаријанско">Вегетаријанско</option>
                    <option value="Веганско">Веганско</option>
                    <option value="Детско">Детско</option>
                  </select>
                </div>
                {attempted && !guest.menu && (
                  <span className="inv__field-error">
                    Пополнете го полето за да продолжите
                  </span>
                )}
              </div>
            ))}

            <button type="button" className="inv__add-guest" onClick={addGuest}>
              + Додај нов гостин
            </button>
          </>
        )}

        {submitted && (
          <p className="inv__form-success">
            Благодариме! Потврдата е испратена.
          </p>
        )}

        <button className="inv__button" type="submit" disabled={submitting}>
          {submitting ? "Се испраќа..." : attending ? "Потврди" : "Испрати"}
        </button>
      </form>
    </section>
  );
}
