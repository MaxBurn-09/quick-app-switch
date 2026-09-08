import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Chip, SectionTitle } from "@/components/AppShell";
import {
  activitiesQuery,
  announcementsQuery,
  eventsQuery,
  postsQuery,
  registrationsQuery,
} from "@/lib/queries";
import { useMe } from "@/hooks/useSession";
import { coverFor, accentFor } from "@/lib/event-images";
import { countdownLabel, longDate, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Home — Searching Eyes Campus Community" },
      {
        name: "description",
        content: "Your campus dashboard: upcoming events, priority announcements and club activity.",
      },
      { property: "og:title", content: "Home — Searching Eyes" },
      { property: "og:description", content: "Upcoming events, announcements and club activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { profile, user, isAdmin } = useMe();
  const events = useQuery(eventsQuery);
  const announcements = useQuery(announcementsQuery);
  const activities = useQuery(activitiesQuery);
  const posts = useQuery(postsQuery);
  const regs = useQuery(registrationsQuery);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (events.data ?? []).filter((e) => e.event_date >= today);
  const featured = upcoming.find((e) => e.featured) ?? upcoming[0];
  const myRegs = (regs.data ?? []).filter((r) => r.user_id === user?.id).length;

  return (
    <div className="fadeup space-y-7">
      <div>
        <p className="text-fog font-mono text-[10px] tracking-[0.25em] uppercase">
          {longDate(new Date().toISOString())}
        </p>
        <h1 className="font-display mt-1 text-3xl leading-none tracking-tight">
          HELLO, {(profile?.full_name ?? "STUDENT").split(" ")[0]?.toUpperCase()}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="EVENTS" value={upcoming.length} tone="saffron" />
        <Stat label="JOINED" value={myRegs} tone="jade" />
        <Stat label="POSTS" value={(posts.data ?? []).filter((p) => !p.removed).length} tone="sky" />
      </div>

      {featured && (
        <Link to="/events/$id" params={{ id: featured.id }} className="block">
          <div className="border-border relative overflow-hidden rounded-2xl border">
            <img
              src={coverFor(featured.category, featured.cover_image)}
              alt={featured.title}
              className="h-44 w-full object-cover sm:h-60 lg:h-72"
              loading="lazy"
            />
            <div className="from-canvas absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-4">
              <div className="mb-2.5 inline-block">
                <Chip tone={accentFor(featured.category)}>{countdownLabel(featured.event_date)}</Chip>
              </div>
              <h2 className="font-display block text-2xl leading-tight tracking-tight">
                {featured.title}
              </h2>
              <p className="text-fog text-xs">
                {longDate(featured.event_date)} · {featured.location}
              </p>
            </div>
          </div>
        </Link>
      )}

      <section>
        <SectionTitle aside={<Link to="/announcements">SEE ALL</Link>}>Announcements</SectionTitle>
        <div className="space-y-2">
          {(announcements.data ?? []).slice(0, 3).map((a) => (
            <div
              key={a.id}
              className={`bg-card border-border rounded-xl border p-3 ${
                a.priority === "urgent" ? "border-l-rose border-l-4" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <Chip tone={a.priority === "urgent" ? "rose" : "sky"}>
                  {a.priority.toUpperCase()}
                </Chip>
                <span className="text-fog font-mono text-[10px]">{timeAgo(a.published_at)}</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold">{a.title}</p>
              <p className="text-fog line-clamp-2 text-xs">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle aside={<Link to="/events">SEE ALL</Link>}>Upcoming events</SectionTitle>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {upcoming.slice(0, 6).map((e) => (
            <Link
              key={e.id}
              to="/events/$id"
              params={{ id: e.id }}
              className="border-border bg-card w-44 shrink-0 overflow-hidden rounded-xl border sm:w-auto"
            >
              <img
                src={coverFor(e.category, e.cover_image)}
                alt={e.title}
                className="h-24 w-full object-cover"
                loading="lazy"
              />
              <div className="p-2.5">
                <p className="line-clamp-2 text-xs font-semibold">{e.title}</p>
                <p className="text-fog mt-1 font-mono text-[10px]">{longDate(e.event_date)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle aside={<Link to="/activities">SEE ALL</Link>}>Recent activity</SectionTitle>
        <div className="space-y-2">
          {(activities.data ?? []).slice(0, 3).map((a) => (
            <div key={a.id} className="bg-card border-border rounded-xl border p-3">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-fog line-clamp-2 text-xs">{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      {isAdmin && (
        <Link
          to="/admin"
          className="bg-card2 border-border block rounded-xl border px-4 py-3 text-center text-sm"
        >
          Open admin tools →
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  const colors: Record<string, string> = {
    saffron: "text-saffron",
    jade: "text-jade",
    sky: "text-sky",
  };
  return (
    <div className="bg-card border-border rounded-xl border p-3 text-center">
      <p className={`font-display text-2xl leading-none ${colors[tone]}`}>{value}</p>
      <p className="text-fog mt-1 font-mono text-[9px] tracking-wider">{label}</p>
    </div>
  );
}
