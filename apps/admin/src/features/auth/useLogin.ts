import { useState } from "react";
import { useRouter } from "next/router";
import type { CurrentUser } from "@pokanito/shared";
import { errorMessage } from "@pokanito/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { safeNext } from "./utils";

/** Sign-in form; on success goes to `?next=` (an in-admin path) or home. */
export function useLogin() {
  const router = useRouter();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      setUser(await api.post<CurrentUser>("/api/admin/auth/login", { email, password }));
      await router.replace(safeNext(router.query.next));
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return { email, setEmail, password, setPassword, submitting, error, handleSubmit };
}
