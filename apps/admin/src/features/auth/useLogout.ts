import { useRouter } from "next/router";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

/** Signs out (ignoring API errors), clears the session and goes to the login page. */
export function useLogout() {
  const router = useRouter();
  const { setUser } = useSession();
  return async () => {
    await api.post("/api/admin/auth/logout").catch(() => undefined);
    setUser(null);
    await router.replace("/login");
  };
}
