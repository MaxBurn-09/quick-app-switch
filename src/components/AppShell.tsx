import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { notificationsQuery } from "@/lib/queries";
import { useMe } from "@/hooks/useSession";
import { initials } from "@/lib/format";

const NAV = [
  { to: "/home", glyph: "▣", label: "HOME" },
  { to: "/events", glyph: "◧", label: "EVENTS" },
  { to: "/community", glyph: "◉", label: "COMMUNITY" },
  { to: "/assistant", glyph: "✦", label: "AI" },
  { to: "/profile", glyph: "◍", label: "PROFILE" },
] as const;

const SIDE_EXTRA = [
  { to: "/announcements", glyph: "❖", label: "ANNOUNCEMENTS" },
  { to: "/activities", glyph: "▤", label: "ACTIVITIES" },
  { to: "/notifications", glyph: "◷", label: "NOTIFICATIONS" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const notifications = useQuery(notificationsQuery);
  const unread = notifications.data?.filter((n) => !n.read).length ?? 0;
  const { profile, isAdmin } = useMe();

  return (
    <div className="bg-canvas relative min-h-screen">
      <div className="bg-rose/20 pointer-events-none fixed -top-24 -left-24 size-72 rounded-full blur-[110px]" />
      <div className="bg-sky/15 pointer-events-none fixed top-32 -right-24 size-72 rounded-full blur-[120px]" />
      <div className="bg-jade/12 pointer-events-none fixed bottom-10 left-1/3 size-72 rounded-full blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="border-border sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r px-4 py-6 lg:flex xl:w-72">
          <Link to="/home" className="px-2">
            <p className="text-fog font-mono text-[10px] tracking-[0.3em] uppercase">Campus</p>
            <p className="font-display text-3xl leading-none tracking-tight">SEARCHING EYES</p>
          </Link>

          <nav className="mt-8 flex flex-col gap-1">
            {[...NAV, ...SIDE_EXTRA].map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active ? "bg-card2 text-saffron" : "text-fog hover:bg-card/60"
                  }`}
                >
                  <span className="w-5 text-center text-base">{item.glyph}</span>
                  <span className="font-mono text-[11px] tracking-wider">{item.label}</span>
                  {item.to === "/notifications" && unread > 0 && (
                    <span className="bg-rose text-canvas ml-auto rounded-full px-1.5 font-mono text-[9px]">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                  pathname.startsWith("/admin") ? "bg-card2 text-saffron" : "text-fog hover:bg-card/60"
                }`}
              >
                <span className="w-5 text-center text-base">⚑</span>
                <span className="font-mono text-[11px] tracking-wider">ADMIN</span>
              </Link>
            )}
          </nav>

          <Link
            to="/profile"
            className="bg-card border-border mt-auto flex items-center gap-3 rounded-xl border p-3"
          >
            <span className="bg-card2 text-saffron grid size-9 shrink-0 place-items-center rounded-full font-mono text-[11px]">
              {initials(profile?.full_name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {profile?.full_name || "Student"}
              </span>
              <span className="text-fog block font-mono text-[10px]">VIEW PROFILE</span>
            </span>
          </Link>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Mobile / tablet header */}
          <header className="bg-canvas/85 border-border sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-4 pt-4 pb-3 backdrop-blur sm:px-6 lg:hidden">
            <Link to="/home" className="min-w-0">
              <p className="text-fog font-mono text-[10px] tracking-[0.25em] uppercase">Campus</p>
              <p className="font-display truncate text-2xl leading-none tracking-tight">
                SEARCHING EYES
              </p>
            </Link>
            <Link
              to="/notifications"
              className="bg-card2 text-ink border-border relative grid size-10 shrink-0 place-items-center rounded-full border"
              aria-label="Notifications"
            >
              <span className="text-lg">◷</span>
              {unread > 0 && (
                <span className="bg-rose ring-canvas absolute top-1.5 right-1.5 size-2 rounded-full ring-2" />
              )}
            </Link>
          </header>

          <main
            className={`mx-auto w-full flex-1 px-4 pt-4 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14 ${
              pathname.startsWith("/admin") ? "max-w-[1240px]" : "max-w-[900px]"
            }`}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bg-canvas/90 border-border fixed right-0 bottom-0 left-0 z-30 grid grid-cols-5 border-t px-2 py-2 backdrop-blur lg:hidden">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 py-1.5 ${
                active ? "text-saffron" : "text-fog"
              }`}
            >
              <span className="text-lg leading-none">{item.glyph}</span>
              <span className="font-mono text-[9px] tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h3 className="font-display text-lg tracking-tight sm:text-xl">{children}</h3>
      {aside ? (
        <span className="text-fog shrink-0 font-mono text-[10px] tracking-wider">{aside}</span>
      ) : null}
    </div>
  );
}

export function Chip({ tone = "saffron", children }: { tone?: string; children: ReactNode }) {
  const map: Record<string, string> = {
    saffron: "bg-saffron/15 text-saffron",
    sky: "bg-sky/15 text-sky",
    rose: "bg-rose/15 text-rose",
    jade: "bg-jade/15 text-jade",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] tracking-wider ${map[tone] ?? map["saffron"]}`}
    >
      {children}
    </span>
  );
}
