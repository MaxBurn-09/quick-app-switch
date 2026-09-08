import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@/components/AppShell";
import { eventsQuery, registrationsQuery } from "@/lib/queries";
import { useMe } from "@/hooks/useSession";
import { accentFor, coverFor } from "@/lib/event-images";
import { longDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/events/")({
  head: () => ({
    meta: [
      { title: "Events — Searching Eyes Campus Community" },
      {
        name: "description",
        content: "Browse upcoming and past campus events, workshops, hackathons and drives.",
      },
      { property: "og:title", content: "Events — Searching Eyes" },
      { property: "og:description", content: "Campus workshops, hackathons, drives and socials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventsPage,
});

const FILTERS = ["upcoming", "joined", "past"] as const;

function EventsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("upcoming");
  const [q, setQ] = useState("");
  const events = useQuery(eventsQuery);
  const regs = useQuery(registrationsQuery);
  const { user } = useMe();

  const today = new Date().toISOString().slice(0, 10);
  const mine = new Set(
    (regs.data ?? []).filter((r) => r.user_id === user?.id).map((r) => r.event_id),
  );

  const list = (events.data ?? [])
    .filter((e) =>
      filter === "upcoming"
        ? e.event_date >= today
        : filter === "past"
          ? e.event_date < today
          : mine.has(e.id),
    )
    .filter((e) => e.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fadeup space-y-4">
      <h1 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">EVENTS</h1>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search events…"
        className="bg-card2 border-border placeholder:text-fog/60 focus:border-saffron w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
      />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase ${
              filter === f ? "bg-saffron text-canvas" : "bg-card2 text-fog"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((e) => (
          <Link
            key={e.id}
            to="/events/$id"
            params={{ id: e.id }}
            className="bg-card border-border flex gap-3 overflow-hidden rounded-2xl border"
          >
            <img
              src={coverFor(e.category, e.cover_image)}
              alt={e.title}
              className="h-full min-h-24 w-24 shrink-0 object-cover sm:w-28"
              loading="lazy"
            />
            <div className="min-w-0 flex-1 py-2.5 pr-3">
              <Chip tone={accentFor(e.category)}>{e.category.toUpperCase()}</Chip>
              <p className="mt-1 line-clamp-2 text-sm font-semibold">{e.title}</p>
              <p className="text-fog mt-0.5 font-mono text-[10px]">
                {longDate(e.event_date)} · {e.location}
              </p>
              {mine.has(e.id) && <span className="text-jade font-mono text-[10px]">JOINED</span>}
            </div>
          </Link>
        ))}
        {list.length === 0 && (
          <p className="text-fog py-10 text-center text-sm">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}
