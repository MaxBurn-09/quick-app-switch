import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { notificationsQuery } from "@/lib/queries";

const NAV = [
  { to: "/home", glyph: "▣", label: "HOME" },
  { to: "/events", glyph: "◧", label: "EVENTS" },
  { to: "/community", glyph: "◉", label: "COMMUNITY" },
  { to: "/assistant", glyph: "✦", label: "AI" },
  { to: "/profile", glyph: "◍", label: "PROFILE" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const notifications = useQuery(notificationsQuery);
  const unread = notifications.data?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="flex min-h-screen flex-col items-center sm:py-8">
      <div className="border-border bg-canvas relative flex min-h-screen w-full max-w-[412px] flex-col overflow-hidden border-x">
        <div className="bg-rose/25 pointer-events-none absolute -top-16 -left-16 size-56 rounded-full blur-[90px]" />
        <div className="bg-sky/20 pointer-events-none absolute top-24 -right-20 size-56 rounded-full blur-[100px]" />
        <div className="bg-jade/15 pointer-events-none absolute bottom-40 -left-10 size-52 rounded-full blur-[90px]" />

        <header className="bg-canvas/85 border-border fadeup sticky top-0 z-30 flex items-center justify-between border-b px-5 pt-4 pb-3 backdrop-blur">
          <Link to="/home">
            <p className="text-fog font-mono text-[10px] tracking-[0.25em] uppercase">Campus</p>
            <p className="font-display text-2xl leading-none tracking-tight">SEARCHING EYES</p>
          </Link>
          <Link
            to="/notifications"
            className="bg-card2 text-ink border-border relative grid size-10 place-items-center rounded-full border"
            aria-label="Notifications"
          >
            <span className="text-lg">◷</span>
            {unread > 0 && (
              <span className="bg-rose ring-canvas absolute top-1.5 right-1.5 size-2 rounded-full ring-2" />
            )}
          </Link>
        </header>

        <main className="relative z-10 flex-1 px-4 pt-4 pb-28">{children}</main>

        <nav className="bg-canvas/90 border-border sticky bottom-0 z-30 grid grid-cols-5 border-t px-2 py-2 backdrop-blur">
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
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="font-display text-lg tracking-tight">{children}</h3>
      {aside ? <span className="text-fog font-mono text-[10px] tracking-wider">{aside}</span> : null}
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
    <span className={`rounded px-2 py-0.5 font-mono text-[10px] tracking-wider ${map[tone]}`}>
      {children}
    </span>
  );
}
