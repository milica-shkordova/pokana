import { useState } from "react";
import { ApiError, type LeadInput } from "@pokanito/shared";
import { publicApi } from "@/lib/api";
import type { LeadSource, LeadStatus } from "./types";

interface Options {
  initialTemplateId: string;
  /** Shown when the send fails (rate limits show the API's own message). */
  errorMessage: string;
  /** After a successful send (fields already cleared). */
  onSent?: () => void;
  /** After a failed send (error already set). */
  onError?: () => void;
}

/**
 * State and submit of a landing lead form (contact form, "notify me"): the
 * fields, the honeypot, the POST to /leads and its error handling.
 */
export function useLeadForm(source: LeadSource, { initialTemplateId, errorMessage, onSent, onError }: Options) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<LeadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await publicApi.lead({
        source,
        name,
        contact,
        templateId: templateId || undefined,
        message: message || undefined,
        website,
      } satisfies LeadInput);
      setStatus("sent");
      setName("");
      setContact("");
      setMessage("");
      onSent?.();
    } catch (err) {
      setStatus("idle");
      setError(err instanceof ApiError && err.status === 429 ? err.message : errorMessage);
      onError?.();
    }
  };

  return {
    name,
    setName,
    contact,
    setContact,
    templateId,
    setTemplateId,
    message,
    setMessage,
    website,
    setWebsite,
    status,
    setStatus,
    error,
    setError,
    submit,
  };
}
