import { useState } from "react";
import config from "@/config";

type Guest = { name: string; menu: string; leaving?: boolean };

export default function RsvpForm() {
  const [guests, setGuests] = useState<Guest[]>([{ name: "", menu: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const updateGuest = (index: number, field: "name" | "menu", value: string) => {
    setGuests((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  };

  const addGuest = () => {
    setGuests((prev) => [...prev, { name: "", menu: "" }]);
    setAttempted(false);
  };

  const removeGuest = (index: number) => {
    setGuests((prev) => prev.map((g, i) => (i === index ? { ...g, leaving: true } : g)));
    setTimeout(() => {
      setGuests((prev) => prev.filter((g) => !g.leaving));
    }, 280);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (guests.some((g) => !g.name || !g.menu)) return;
    setSubmitting(true);

    const guestLines = guests.map((g) => `${g.name} — ${g.menu}`).join("\n");
    const coupleName = `${config.bride} & ${config.groom}`;
    const message = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `  RSVP — ${coupleName}`,
      `  ${config.weddingDateLabel} · ${config.venue.name}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      guestLines,
      "",
      `  Вкупно гости: ${guests.length}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ].join("\n");

    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: config.web3formsKey,
        from_name: `Покана — ${coupleName}`,
        subject: `RSVP: ${guests[0].name} (${guests.length} ${guests.length === 1 ? "гостин" : "гости"})`,
        message,
      }),
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
        Ве замолуваме да го потврдите вашето присуство најдоцна до {config.rsvpDeadline}
      </p>
      <form className="inv__form" onSubmit={handleSubmit}>
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

        {submitted && (
          <p className="inv__form-success">Благодариме! Потврдата е испратена.</p>
        )}

        <button className="inv__button" type="submit" disabled={submitting}>
          {submitting ? "Се испраќа..." : "Потврди"}
        </button>
      </form>
    </section>
  );
}
