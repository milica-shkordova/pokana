import { useEffect } from "react";
import { Alert, Button, Dialog, Field, Input, Select, HoneypotField } from "@pokanito/ui";
import { useLang } from "./i18n";
import { useLeadForm } from "./contact/useLeadForm";
import type { NotifyDialogProps } from "./contact/types";

/** "Notify me" for coming-soon templates → a Lead with source=notify-me. */
export default function NotifyDialog({ open, onClose, templates, initialTemplateId }: NotifyDialogProps) {
  const n = useLang().t.notify;
  const { name, setName, contact, setContact, templateId, setTemplateId, website, setWebsite, status, setStatus, error, setError, submit } =
    useLeadForm("notify-me", { initialTemplateId, errorMessage: n.error });

  useEffect(() => {
    if (open) {
      setTemplateId(initialTemplateId || templates[0]?.id || "");
      setStatus("idle");
      setError(null);
    }
  }, [open, initialTemplateId, templates, setTemplateId, setStatus, setError]);

  const chosen = templates.find((t) => t.id === templateId);

  return (
    <Dialog open={open} onClose={onClose} title={n.title}>
      {status === "sent" ? (
        <>
          <Alert tone="success">
            {n.sentBefore}
            {chosen ? <b>{chosen.name}</b> : n.sentFallback}
            {n.sentAfter}
          </Alert>
          <div className="ui-dialog__footer">
            <Button onClick={onClose}>{n.done}</Button>
          </div>
        </>
      ) : (
        <form className="lp-dialog-form" onSubmit={submit}>
          <p className="ui-text-muted">{n.intro}</p>
          <Field label={n.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </Field>
          <Field label={n.contact}>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} required minLength={3} />
          </Field>
          <Field label={n.template}>
            <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <HoneypotField value={website} onChange={setWebsite} />
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="ui-dialog__footer">
            <Button variant="secondary" onClick={onClose}>
              {n.cancel}
            </Button>
            <Button type="submit" loading={status === "sending"}>
              {n.submit}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
