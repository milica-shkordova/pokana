import { useState } from "react";
import { isEmail, parseEmails, type EventDetail } from "@pokanito/shared";
import { useToast, errorMessage } from "@pokanito/ui";
import { api } from "@/lib/api";
import type { EventEditor } from "./useEventEditor";

/** "Send RSVP replies to" addresses (saved while valid) and the test email. */
export function useRsvpTest(
  event: EventDetail,
  { update, applyServer, flush }: { update: EventEditor["update"]; applyServer: (e: EventDetail) => void; flush: () => Promise<void> },
) {
  const toast = useToast();
  const [emails, setEmails] = useState(event.rsvpEmails.join(", "));
  const [testing, setTesting] = useState(false);
  const [testedTo, setTestedTo] = useState<string[] | null>(null);
  const parsed = parseEmails(emails);
  const badEmail = parsed.find((e) => !isEmail(e));

  const changeEmails = (value: string) => {
    setEmails(value);
    setTestedTo(null);
    const list = parseEmails(value);
    if (!list.some((x) => !isEmail(x)))
      update({ rsvpEmails: list });
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      await flush();
      const res = await api.post<{ to: string[]; dev?: boolean }>(
        `/api/admin/events/${event.id}/test-email`,
      );
      setTestedTo(res.to);
      applyServer(await api.get<EventDetail>(`/api/admin/events/${event.id}`));
      if (res.dev) toast("Dev mode: the email was printed in the API console");
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setTesting(false);
    }
  };

  return { emails, changeEmails, parsed, badEmail, testing, testedTo, sendTest };
}
