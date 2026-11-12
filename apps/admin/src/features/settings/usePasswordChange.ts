import { useState } from "react";
import { useToast } from "@pokanito/ui";
import { api } from "@/lib/api";

/** "Your account" form: current + new password. */
export function usePasswordChange() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/admin/auth/password", {
        currentPassword: current,
        newPassword: next,
      });
      setCurrent("");
      setNext("");
      toast("Password changed");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  return { current, setCurrent, next, setNext, busy, error, submit };
}
