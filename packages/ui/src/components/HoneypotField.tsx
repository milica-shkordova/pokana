export interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Spam trap: a "Website" input hidden from people (and assistive tech) that
 * bots fill in. Send its value with the form; the API rejects non-empty ones.
 */
export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <div className="ui-visually-hidden-field" aria-hidden>
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
