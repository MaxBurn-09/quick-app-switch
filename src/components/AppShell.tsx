import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  CircleUserRound,
  House,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Sparkles,
  Trophy,
} from "lucide-react";
import { notificationsQuery } from "@/lib/queries";
import { useMe } from "@/hooks/useSession";
import { initials } from "@/lib/format";

const NAV = [
  { to: "/home", icon: House, label: "Home" },
  { to: "/events", icon: CalendarDays, label: "Events" },
  { to: "/community", icon: MessagesSquare, label: "Community" },
  { to: "/assistant", icon: Sparkles, label: "Assistant" },
  { to: "/profile", icon: CircleUserRound, label: "Profile" },
] as const;

const SIDE_EXTRA = [
  { to: "/announcements", icon: Megaphone, label: "Announcements" },
  { to: "/activities", icon: Trophy, label: "Activities" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const notifications = useQuery(notificationsQuery);
  const unread = notifications.data?.filter((n) => !n.read).length ?? 0;
  const { profile, isAdmin } = useMe();

  return (
    <div className="bg-canvas min-h-screen">
      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="border-border bg-card sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r px-5 py-8 lg:flex xl:w-72">
          <Link to="/home" className="flex items-center gap-3 px-2">
            <span className="bg-ink text-card grid size-9 place-items-center rounded-lg font-display text-lg font-bold">S</span>
            <span>
              <span className="font-display block text-lg font-semibold leading-tight">Searching Eyes</span>
              <span className="text-fog block text-xs">MDU campus</span>
            </span>
          </Link>

          <nav className="mt-10 flex flex-col gap-1">
            {[...NAV, ...SIDE_EXTRA].map((item) => {
              const active = pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-card2 text-ink" : "text-fog hover:bg-card2 hover:text-ink"
                  }`}
                >
                  <Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                  {item.to === "/notifications" && unread > 0 && (
                    <span className="bg-primary text-primary-foreground ml-auto rounded-full px-1.5 text-[10px]">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname.startsWith("/admin") ? "bg-card2 text-ink" : "text-fog hover:bg-card2 hover:text-ink"
                }`}
              >
                <LayoutDashboard className="size-[18px]" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          <Link
            to="/profile"
            className="border-border mt-auto flex items-center gap-3 border-t px-2 pt-5"
          >
            <span className="bg-card2 text-ink grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold">
              {initials(profile?.full_name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {profile?.full_name || "Student"}
              </span>
              <span className="text-fog block text-xs">View profile</span>
            </span>
          </Link>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Mobile / tablet header */}
          <header className="bg-card/90 border-border sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-5 py-3 backdrop-blur-xl sm:px-8 lg:hidden">
            <Link to="/home" className="flex min-w-0 items-center gap-2.5">
              <span className="bg-ink text-card grid size-8 place-items-center rounded-lg font-display font-bold">S</span>
              <p className="font-display truncate text-lg font-semibold">Searching Eyes</p>
            </Link>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/notifications"
                className="text-fog hover:bg-card2 hover:text-ink relative grid size-10 shrink-0 place-items-center rounded-full transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="bg-primary ring-card absolute top-1.5 right-1.5 size-2 rounded-full ring-2" />
                )}
              </Link>
              <Link
                to="/profile"
                className="bg-card2 text-ink grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                aria-label="My profile"
              >
                {initials(profile?.full_name)}
              </Link>
            </div>
          </header>

          <main
            className={`mx-auto w-full flex-1 px-5 pt-8 pb-28 sm:px-8 sm:pt-10 lg:px-12 lg:pt-14 lg:pb-20 xl:px-16 ${
              pathname.startsWith("/admin") ? "max-w-[1320px]" : "max-w-[1120px]"
            }`}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bg-card/92 border-border fixed right-0 bottom-0 left-0 z-30 grid grid-cols-5 border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 py-1.5 ${
                active ? "text-primary" : "text-fog"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h3 className="font-display text-xl font-semibold sm:text-2xl">{children}</h3>
      {aside ? (
        <span className="text-primary shrink-0 text-sm font-medium">{aside}</span>
      ) : null}
    </div>
  );
}

export function Chip({ tone = "saffron", children }: { tone?: string; children: ReactNode }) {
  const map: Record<string, string> = {
    saffron: "bg-accent text-primary",
    sky: "bg-card2 text-ink",
    rose: "bg-rose/10 text-rose",
    jade: "bg-jade/10 text-jade",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[tone] ?? map["saffron"]}`}
    >
      {children}
    </span>
  );
}
