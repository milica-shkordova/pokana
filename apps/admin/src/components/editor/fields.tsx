import { createContext, useContext, useId, type ReactNode } from "react";
import type { Locale, LocalizedText } from "@pokanito/shared";
import { Field, IconButton, Input, Textarea, cx } from "@pokanito/ui";

interface LocalizedFieldProps {
  label: string;
  value: LocalizedText | undefined;
  onChange: (value: LocalizedText) => void;
  languages: Locale[];
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: ReactNode;
  full?: boolean;
}

/** One input per enabled language; labelled "· MK" / "· EN" only when both are on. */
export function LocalizedField({ label, value, onChange, languages, multiline, rows = 4, placeholder, hint, full }: LocalizedFieldProps) {
  const both = languages.length > 1;
  return (
    <>
      {languages.map((l, i) => {
        const fieldLabel = both ? `${label} · ${l.toUpperCase()}` : label;
        const common = {
          value: value?.[l] ?? "",
          lang: l,
          placeholder,
          onChange: (e: { target: { value: string } }) => onChange({ ...value, [l]: e.target.value }),
        };
        return (
          <Field key={l} label={fieldLabel} hint={i === languages.length - 1 ? hint : undefined} full={full || multiline}>
            {multiline ? <Textarea rows={rows} {...common} /> : <Input {...common} />}
          </Field>
        );
      })}
    </>
  );
}

/** Compact localized input for table-like rows (no visible label; aria-label instead). */
export function LocalizedInline({
  label,
  value,
  onChange,
  languages,
  placeholder,
}: {
  label: string;
  value: LocalizedText | undefined;
  onChange: (value: LocalizedText) => void;
  languages: Locale[];
  placeholder?: string;
}) {
  const both = languages.length > 1;
  return (
    <div className="admin-inline-loc">
      {languages.map((l) => (
        <input
          key={l}
          className="ui-input"
          lang={l}
          aria-label={both ? `${label} (${l.toUpperCase()})` : label}
          placeholder={both ? `${placeholder ?? label} · ${l.toUpperCase()}` : placeholder ?? label}
          value={value?.[l] ?? ""}
          onChange={(e) => onChange({ ...value, [l]: e.target.value })}
        />
      ))}
    </div>
  );
}

/** Section card with the serif heading used throughout the editor. */
/**
 * Lets the editor page inject per-card extras (section on/off + reorder
 * controls, the "section is off" notice) without threading props through
 * every form.
 */
export const EditorCardSlot = createContext<{ actions?: ReactNode; notice?: ReactNode; muted?: boolean }>({});

export function EditorCard({ title, aside, children }: { title: ReactNode; aside?: ReactNode; children: ReactNode }) {
  const id = useId();
  const slot = useContext(EditorCardSlot);
  return (
    <section className={cx("admin-editor-card", slot.muted && "admin-editor-card--off")} aria-labelledby={id}>
      <div className="admin-editor-card__head">
        <h2 id={id} className="admin-editor-card__title">
          {title}
        </h2>
        {aside && <div className="admin-editor-card__aside">{aside}</div>}
        {slot.actions && <div className="admin-editor-card__actions">{slot.actions}</div>}
      </div>
      {slot.notice}
      {children}
    </section>
  );
}

/** Up / down / remove controls for list rows. */
export function RowControls({
  index,
  count,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  label: string;
}) {
  return (
    <div className="admin-row-controls">
      <IconButton aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        ↑
      </IconButton>
      <IconButton aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        ↓
      </IconButton>
      <IconButton tone="danger" aria-label={`Remove ${label}`} onClick={onRemove}>
        ×
      </IconButton>
    </div>
  );
}

export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
