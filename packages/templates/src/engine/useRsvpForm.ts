import { useState } from "react";
import type { RsvpInput, RsvpMode } from "@pokanito/shared";
import { useInvitation } from "./runtime";

export interface GuestRow {
  key: number;
  name: string;
  menu: string;
  leaving?: boolean;
}

let rowKey = 0;
const newRow = (): GuestRow => ({ key: ++rowKey, name: "", menu: "" });

/**
 * All RSVP form state and submission for every mode. Templates render their
 * own markup around it:
 *
 *   const f = useRsvpForm();
 *   <form onSubmit={f.submit}> … f.fields.name / f.set("name", v) …
 *
 * `f.error("name")` returns the "please fill this in" message once the guest
 * has tried to submit.
 */
export function useRsvpForm(modeOverride?: RsvpMode) {
  const { event, def, s, submitRsvp, locale } = useInvitation();
  const config = event.content.rsvp;
  const mode = modeOverride ?? config?.mode ?? def.rsvpMode;
  const menuOptions = config?.menuOptions ?? [];
  const needsMenu = mode === "guests-with-menu" && menuOptions.length > 0;

  const [attending, setAttending] = useState(true);
  const [fields, setFields] = useState({
    name: "",
    guestCount: 1,
    adults: 1,
    children: 1,
    plusOne: false,
    company: "",
    email: "",
    dinner: true,
    allergies: "",
    message: "",
  });
  const [guests, setGuests] = useState<GuestRow[]>(() => [newRow()]);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = <K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) =>
    setFields((f) => ({ ...f, [key]: value }));

  const updateGuest = (key: number, patch: Partial<GuestRow>) =>
    setGuests((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addGuest = () => {
    setGuests((rows) => [...rows, newRow()]);
    setAttempted(false);
  };
  /** Marks the row as leaving (for an exit animation), then removes it. */
  const removeGuest = (key: number, delayMs = 280) => {
    updateGuest(key, { leaving: true });
    setTimeout(() => setGuests((rows) => rows.filter((r) => r.key !== key)), delayMs);
  };

  const primaryName = mode === "guests-with-menu" ? (guests[0]?.name ?? "") : fields.name;

  const invalid = (att: boolean): boolean => {
    if (!primaryName.trim()) return true;
    if (mode === "guests-with-menu" && att) {
      return guests.some((g) => !g.name.trim() || (needsMenu && !g.menu));
    }
    return false;
  };

  /** Validation message for a field (only after a submit attempt). */
  const error = (field: "name" | `guest-${number}-name` | `guest-${number}-menu`): string | null => {
    if (!attempted) return null;
    if (field === "name") return primaryName.trim() ? null : s.required;
    const [, key, part] = field.split("-");
    const row = guests.find((g) => g.key === Number(key));
    if (!row) return null;
    if (part === "name") return row.name.trim() ? null : s.required;
    return needsMenu && attending && !row.menu ? s.required : null;
  };

  const payload = (attending: boolean): RsvpInput => {
    const base = { attending, name: primaryName.trim(), locale };
    const extras = {
      allergies: config?.askAllergies ? fields.allergies : undefined,
      message: config?.askMessage ? fields.message : undefined,
    };
    if (!attending) return { ...base, guestCount: 0, ...extras };
    switch (mode) {
      case "guests-with-menu":
        return {
          ...base,
          ...extras,
          guestCount: guests.length,
          guests: guests.map((g) => ({ name: g.name.trim(), menu: g.menu || undefined })),
        };
      case "guest-count":
        return { ...base, ...extras, guestCount: fields.guestCount };
      case "kids":
        return { ...base, ...extras, adults: fields.adults, children: fields.children, allergies: fields.allergies };
      case "plus-one":
        return { ...base, ...extras, plusOne: fields.plusOne, guestCount: fields.plusOne ? 2 : 1 };
      case "registration":
        return { ...base, ...extras, company: fields.company, email: fields.email, dinner: fields.dinner, guestCount: 1 };
    }
  };

  const send = async (att: boolean) => {
    setAttempted(true);
    if (invalid(att)) return;
    setStatus("sending");
    try {
      await submitRsvp(payload(att));
      setStatus("sent");
      setAttempted(false);
      setGuests([newRow()]);
      setFields((f) => ({ ...f, name: "", allergies: "", message: "", company: "", email: "" }));
    } catch {
      setStatus("error");
    }
  };

  const submit = async (e?: { preventDefault(): void }) => {
    e?.preventDefault();
    await send(attending);
  };

  /** For designs with two submit buttons ("We'll come" / "Can't make it"). */
  const submitAs = async (att: boolean) => {
    setAttending(att);
    await send(att);
  };

  return {
    mode,
    open: event.rsvpOpen,
    menuOptions,
    needsMenu,
    askAllergies: !!config?.askAllergies || mode === "kids",
    askMessage: !!config?.askMessage,
    attending,
    setAttending: (v: boolean) => {
      setAttending(v);
      setAttempted(false);
    },
    fields,
    set,
    guests,
    updateGuest,
    addGuest,
    removeGuest,
    error,
    submit,
    submitAs,
    status,
    sending: status === "sending",
    sent: status === "sent",
    failed: status === "error",
    /** Text for the result line, or null. */
    resultText: status === "sent" ? (attending ? s.thanks : s.thanksDecline) : status === "error" ? s.error : null,
    submitLabel: status === "sending" ? s.sending : attending ? s.submit : s.submitDecline,
    reset: () => setStatus("idle"),
  };
}
