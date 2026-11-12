import type { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Avatar,
  Button,
  PageHeader,
  Spinner,
  Wordmark,
  cx,
  IconCalendar,
  IconChat,
  IconImage,
  IconSettings,
  IconTemplates,
} from "@pokanito/ui";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

interface Props {
  title: string;
  kicker?: ReactNode;
  actions?: ReactNode;
  /** Replaces the standard kicker/title/actions header (the title still names the tab). */
  header?: ReactNode;
  children: ReactNode;
}

/** Gate for any signed-in page: spinner until /me resolves (401 redirects to /login). */
export function AuthGate({ children, title }: { children: ReactNode; title: string }) {
  const { user } = useSession();
  return (
    <>
      <Head>
        <title>{`${title} · Pokanito Admin`}</title>
      </Head>
      {user ? (
        children
      ) : (
        <div className="admin-splash">
          <Spinner size="lg" label="Loading" />
        </div>
      )}
    </>
  );
}

export default function AdminLayout({ title, kicker, actions, header, children }: Props) {
  const router = useRouter();
  const { user, stats, setUser } = useSession();

  const nav = [
    { href: "/", label: "Events", icon: <IconCalendar />, count: stats ? stats.live + stats.draftsAndReview : undefined },
    { href: "/templates", label: "Templates", icon: <IconTemplates /> },
    { href: "/leads", label: "Leads", icon: <IconChat />, badge: stats?.newLeads || undefined },
    { href: "/media", label: "Media library", icon: <IconImage /> },
    { href: "/settings", label: "Settings", icon: <IconSettings /> },
  ];

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" || router.pathname.startsWith("/events") : router.pathname.startsWith(href);

  const logout = async () => {
    await api.post("/api/admin/auth/logout").catch(() => undefined);
    setUser(null);
    await router.replace("/login");
  };

  return (
    <AuthGate title={title}>
      <div className="admin ui-root">
        <aside className="admin__sidebar">
          <Link href="/" className="admin__brand" aria-label="Pokanito admin home">
            <Wordmark />
            <span className="admin__brand-tag">Admin</span>
          </Link>
          <nav className="admin__nav" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cx("admin__nav-link", isActive(item.href) && "admin__nav-link--active")}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.icon}
                {item.label}
                {item.count !== undefined && <span className="admin__nav-count">{item.count}</span>}
                {item.badge !== undefined && (
                  <span className="admin__nav-badge" aria-label={`${item.badge} unread`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          {user && (
            <div className="admin__user">
              <Avatar name={user.name ?? user.email} />
              <div className="admin__user-text">
                <span className="admin__user-name">{user.name ?? user.email}</span>
                <span className="admin__user-role">{user.role === "owner" ? "Owner" : "Editor"}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                Log out
              </Button>
            </div>
          )}
        </aside>
        <main className="admin__main" id="main">
          {header ?? <PageHeader kicker={kicker} title={title} actions={actions} />}
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
