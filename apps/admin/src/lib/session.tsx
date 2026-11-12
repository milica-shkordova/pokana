import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import type { CurrentUser, EventStats } from "@pokanito/shared";
import { api } from "./api";

interface Session {
  user: CurrentUser | null;
  stats: EventStats | null;
  /** Re-fetch sidebar counts (events, unread leads). */
  refreshStats: () => void;
  setUser: (u: CurrentUser | null) => void;
}

const Ctx = createContext<Session>({ user: null, stats: null, refreshStats: () => undefined, setUser: () => undefined });

const PUBLIC_PAGES = ["/login", "/accept-invite"];

/** Loads the signed-in team member once; pages render after it resolves. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isPublic = PUBLIC_PAGES.includes(router.pathname);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);

  useEffect(() => {
    if (isPublic || user) return;
    api
      .get<CurrentUser>("/api/admin/auth/me")
      .then(setUser)
      .catch(() => undefined); // api() redirects to /login on 401
  }, [isPublic, user]);

  const refreshStats = useCallback(() => {
    api
      .get<EventStats>("/api/admin/events/stats")
      .then(setStats)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user) refreshStats();
  }, [user, refreshStats, router.pathname]);

  return <Ctx.Provider value={{ user, stats, refreshStats, setUser }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);
