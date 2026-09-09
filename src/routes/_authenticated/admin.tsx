import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import {
  adminStatsQuery,
  eventsQuery,
  postsQuery,
  registrationsQuery,
  reportsQuery,
  type Profile,
} from "@/lib/queries";
import { Chip } from "@/components/AppShell";
import { longDate, timeAgo, initials } from "@/lib/format";
import { accentFor } from "@/lib/event-images";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Searching Eyes" },
      {
        name: "description",
        content:
          "Club admin dashboard: membership statistics, an event calendar with attendees, announcements and post moderation.",
      },
      { property: "og:title", content: "Admin dashboard — Searching Eyes" },
      {
        property: "og:description",
        content: "Statistics, event calendar, announcements and moderation for club admins.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "dashboard", label: "Dashboard", hint: "Overview & calendar" },
  { id: "events", label: "Events", hint: "Create & manage" },
  { id: "announcements", label: "Announcements", hint: "Notices to members" },
  { id: "moderation", label: "Moderation", hint: "Reported posts" },
  { id: "team", label: "Admin team", hint: "Super admin only" },
  { id: "profile", label: "My profile", hint: "Your admin details" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminPage() {
  const { isAdmin, user, profile, profiles, roles, loading } = useMe();
  const isSuper = roles.includes("super_admin");
  const [tab, setTab] = useState<TabId>("dashboard");

  if (loading) {
    return (
      <div className="space-y-4 py-10">
        <div className="bg-card/60 h-28 animate-pulse rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-card/50 h-28 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="font-display text-3xl tracking-tight">ADMIN ONLY</h1>
        <p className="text-fog mt-3 text-sm">
          This area is reserved for club admins. If you manage a club, ask a super admin to give you
          access.
        </p>
        <Link
          to="/home"
          className="bg-card2 border-border mt-6 inline-block rounded-xl border px-5 py-2.5 text-sm"
        >
          Back to my dashboard
        </Link>
      </div>
    );
  }

  const visibleTabs = TABS.filter((t) => t.id !== "team" || isSuper);
  const current = visibleTabs.some((t) => t.id === tab) ? tab : "dashboard";
  const active = visibleTabs.find((t) => t.id === current)!;

  return (
    <div className="fadeup space-y-6">
      <header className="border-border bg-card/60 rounded-2xl border p-5 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-saffron font-mono text-[10px] tracking-[0.3em] uppercase">
              Club admin workspace
            </p>
            <h1 className="font-display mt-1.5 text-3xl leading-none tracking-tight sm:text-4xl lg:text-5xl">
              ADMIN DASHBOARD
            </h1>
            <p className="text-fog mt-2 max-w-lg text-sm">
              {active.label} · {active.hint}. Students see their own separate dashboard.
            </p>
          </div>
          <Link
            to="/home"
            className="border-border bg-card2 hover:border-saffron self-start rounded-xl border px-4 py-2.5 font-mono text-[10px] tracking-wider uppercase transition-colors"
          >
            Student view →
          </Link>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 font-mono text-[10px] tracking-wider uppercase transition-colors ${
                tab === t.id
                  ? "bg-saffron text-canvas"
                  : "bg-card2 text-fog hover:text-ink border-border border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {current === "dashboard" && <Dashboard />}
      {current === "events" && <EventForm userId={user?.id} />}
      {current === "announcements" && <AnnouncementForm userId={user?.id} />}
      {current === "team" && <AdminTeam profiles={profiles} />}
      {current === "moderation" && <Moderation profiles={profiles} userId={user?.id} />}
      {current === "profile" && <AdminProfile profile={profile} userId={user?.id} />}
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-fog font-mono text-[10px] tracking-wider uppercase">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "bg-card2 border-border focus:border-saffron mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors";

function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-card border-border rounded-2xl border p-5 ${className}`}>
      <h2 className="font-display text-lg tracking-tight">{title}</h2>
      {subtitle && <p className="text-fog mt-0.5 text-xs">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ---------------- dashboard ---------------- */

function StatCard({
  label,
  value,
  week,
  tone,
}: {
  label: string;
  value: number;
  week: number;
  tone: string;
}) {
  return (
    <div className="bg-card border-border rounded-2xl border p-5">
      <p className="text-fog font-mono text-[10px] tracking-wider uppercase">{label}</p>
      <p className="font-display mt-2 text-4xl leading-none tracking-tight lg:text-5xl">{value}</p>
      <p className={`mt-3 font-mono text-[10px] tracking-wider ${tone}`}>+{week} THIS WEEK</p>
    </div>
  );
}

function Dashboard() {
  const stats = useQuery(adminStatsQuery);
  const s = stats.data;

  if (stats.isLoading) return <p className="text-fog text-sm">Loading your numbers…</p>;
  if (!s) return <p className="text-fog text-sm">No statistics available yet.</p>;

  const bars = [
    { label: "Members", value: s.members, week: s.members_week },
    { label: "Event sign-ups", value: s.registrations, week: s.registrations_week },
    { label: "Community posts", value: s.posts, week: s.posts_week },
    { label: "Notifications", value: s.notifications, week: s.notifications_week },
  ];
  const peak = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total members" value={s.members} week={s.members_week} tone="text-jade" />
        <StatCard
          label="Registered attendees"
          value={s.registrations}
          week={s.registrations_week}
          tone="text-saffron"
        />
        <StatCard label="Community posts" value={s.posts} week={s.posts_week} tone="text-sky" />
        <StatCard
          label="Notifications sent"
          value={s.notifications}
          week={s.notifications_week}
          tone="text-rose"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <EventCalendar />

        <div className="space-y-4">
          <Panel title="Overall activity" subtitle="All-time totals, weekly change on the right">
            <div className="space-y-4">
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm">{b.label}</span>
                    <span className="text-fog font-mono text-[10px]">
                      {b.value} · +{b.week} / 7 DAYS
                    </span>
                  </div>
                  <div className="bg-card2 h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-saffron h-full rounded-full transition-all"
                      style={{ width: `${Math.round((b.value / peak) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="At a glance">
            <dl className="space-y-2.5 text-sm">
              <Row label="Events published" value={s.events} />
              <Row label="Open reports" value={s.open_reports} alert={s.open_reports > 0} />
              <Row label="New members this week" value={s.members_week} />
              <Row label="Sign-ups this week" value={s.registrations_week} />
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-fog">{label}</dt>
      <dd className={alert ? "text-rose font-semibold" : "font-semibold"}>{value}</dd>
    </div>
  );
}

function EventCalendar() {
  const events = useQuery(eventsQuery);
  const regs = useQuery(registrationsQuery);
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = (events.data ?? [])
    .filter((e) => e.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const countFor = (id: string) => (regs.data ?? []).filter((r) => r.event_id === id).length;

  const groups = upcoming.reduce<Record<string, typeof upcoming>>((acc, e) => {
    const key = e.event_date.slice(0, 7);
    (acc[key] ??= []).push(e);
    return acc;
  }, {});

  return (
    <Panel
      title="Event calendar"
      subtitle="Upcoming events with dates, times and registered attendees"
    >
      {upcoming.length === 0 ? (
        <p className="text-fog text-sm">No upcoming events. Create one from the Events tab.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([month, list]) => (
            <div key={month}>
              <p className="text-fog border-border mb-3 border-b pb-2 font-mono text-[10px] tracking-[0.25em] uppercase">
                {new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div className="space-y-2.5">
                {list.map((e) => {
                  const d = new Date(`${e.event_date}T00:00:00`);
                  const attendees = countFor(e.id);
                  const full = e.max_participants ? attendees >= e.max_participants : false;
                  return (
                    <Link
                      key={e.id}
                      to="/events/$id"
                      params={{ id: e.id }}
                      className="bg-card2 border-border hover:border-saffron grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border p-3 transition-colors"
                    >
                      <div className="text-center">
                        <p className="font-display text-2xl leading-none">{d.getDate()}</p>
                        <p className="text-fog font-mono text-[9px] tracking-wider uppercase">
                          {d.toLocaleDateString(undefined, { weekday: "short" })}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{e.title}</p>
                        <p className="text-fog truncate font-mono text-[10px] tracking-wide">
                          {(e.start_time ?? "TIME TBC").toUpperCase()}
                          {e.end_time ? ` – ${e.end_time.toUpperCase()}` : ""} ·{" "}
                          {e.location || "Venue TBC"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg leading-none">
                          {attendees}
                          {e.max_participants ? (
                            <span className="text-fog text-xs">/{e.max_participants}</span>
                          ) : null}
                        </p>
                        <p className="text-fog font-mono text-[9px] tracking-wider uppercase">
                          {full ? "FULL" : "attending"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ---------------- events ---------------- */

function EventForm({ userId }: { userId?: string | undefined }) {
  const qc = useQueryClient();
  const events = useQuery(eventsQuery);
  const regs = useQuery(registrationsQuery);
  const [f, setF] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    organizer: "Searching Eyes",
    category: "workshop",
    max_participants: "",
    featured: false,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").insert({
        title: f.title,
        description: f.description,
        event_date: f.event_date,
        start_time: f.start_time || null,
        end_time: f.end_time || null,
        location: f.location,
        organizer: f.organizer,
        category: f.category,
        featured: f.featured,
        max_participants: f.max_participants ? Number(f.max_participants) : null,
        created_by: userId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      setF({ ...f, title: "", description: "", event_date: "", location: "" });
      toast.success("Event published");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const today = new Date().toISOString().slice(0, 10);
  const list = [...(events.data ?? [])].sort((a, b) => a.event_date.localeCompare(b.event_date));
  const countFor = (id: string) => (regs.data ?? []).filter((r) => r.event_id === id).length;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Create an event" subtitle="Published instantly to every member">
        <div className="space-y-3">
          <Labeled label="Title">
            <input
              className={inputCls}
              placeholder="Design sprint workshop"
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
            />
          </Labeled>
          <Labeled label="Description">
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="What happens, who should come, what to bring."
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
            />
          </Labeled>
          <div className="grid gap-3 sm:grid-cols-2">
            <Labeled label="Date">
              <input
                type="date"
                className={inputCls}
                value={f.event_date}
                onChange={(e) => setF({ ...f, event_date: e.target.value })}
              />
            </Labeled>
            <Labeled label="Category">
              <select
                className={inputCls}
                value={f.category}
                onChange={(e) => setF({ ...f, category: e.target.value })}
              >
                {["workshop", "hackathon", "drive", "music", "social", "competition", "general"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </Labeled>
            <Labeled label="Start time">
              <input
                className={inputCls}
                placeholder="10:00 AM"
                value={f.start_time}
                onChange={(e) => setF({ ...f, start_time: e.target.value })}
              />
            </Labeled>
            <Labeled label="End time">
              <input
                className={inputCls}
                placeholder="1:00 PM"
                value={f.end_time}
                onChange={(e) => setF({ ...f, end_time: e.target.value })}
              />
            </Labeled>
            <Labeled label="Venue">
              <input
                className={inputCls}
                placeholder="Seminar hall B"
                value={f.location}
                onChange={(e) => setF({ ...f, location: e.target.value })}
              />
            </Labeled>
            <Labeled label="Seat limit">
              <input
                type="number"
                className={inputCls}
                placeholder="Leave empty for unlimited"
                value={f.max_participants}
                onChange={(e) => setF({ ...f, max_participants: e.target.value })}
              />
            </Labeled>
          </div>
          <label className="text-fog flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.featured}
              onChange={(e) => setF({ ...f, featured: e.target.checked })}
            />
            Feature on the student home screen
          </label>
          <button
            disabled={!f.title || !f.event_date || create.isPending}
            onClick={() => create.mutate()}
            className="bg-saffron text-canvas w-full rounded-lg py-2.5 font-mono text-[11px] tracking-wider disabled:opacity-50"
          >
            {create.isPending ? "PUBLISHING…" : "PUBLISH EVENT"}
          </button>
        </div>
      </Panel>

      <Panel title="All events" subtitle="Attendee counts update live">
        <div className="space-y-2">
          {list.map((e) => (
            <div
              key={e.id}
              className="bg-card2 border-border grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Chip tone={accentFor(e.category)}>{e.category.toUpperCase()}</Chip>
                  {e.event_date < today && (
                    <span className="text-fog font-mono text-[9px] tracking-wider">PAST</span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm font-semibold">{e.title}</p>
                <p className="text-fog font-mono text-[10px]">
                  {longDate(e.event_date)} · {countFor(e.id)} attending
                </p>
              </div>
              <button
                onClick={() => remove.mutate(e.id)}
                className="text-rose border-border hover:bg-rose hover:text-canvas shrink-0 rounded-lg border px-3 py-1.5 font-mono text-[10px] transition-colors"
              >
                DELETE
              </button>
            </div>
          ))}
          {list.length === 0 && <p className="text-fog text-sm">No events yet.</p>}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- announcements ---------------- */

function AnnouncementForm({ userId }: { userId?: string | undefined }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ title: "", body: "", priority: "normal" });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("announcements").insert({
        title: f.title,
        body: f.body,
        priority: f.priority,
        author_id: userId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      setF({ title: "", body: "", priority: "normal" });
      toast.success("Announcement published");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Panel
      title="New announcement"
      subtitle="Appears on every member's home screen"
      className="max-w-2xl"
    >
      <div className="space-y-3">
        <Labeled label="Title">
          <input
            className={inputCls}
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
        </Labeled>
        <Labeled label="Message">
          <textarea
            rows={4}
            className={`${inputCls} resize-none`}
            value={f.body}
            onChange={(e) => setF({ ...f, body: e.target.value })}
          />
        </Labeled>
        <Labeled label="Priority">
          <select
            className={inputCls}
            value={f.priority}
            onChange={(e) => setF({ ...f, priority: e.target.value })}
          >
            <option value="normal">normal</option>
            <option value="urgent">urgent</option>
          </select>
        </Labeled>
        <button
          disabled={!f.title || create.isPending}
          onClick={() => create.mutate()}
          className="bg-saffron text-canvas w-full rounded-lg py-2.5 font-mono text-[11px] tracking-wider disabled:opacity-50"
        >
          PUBLISH ANNOUNCEMENT
        </button>
      </div>
    </Panel>
  );
}

/* ---------------- moderation ---------------- */

function Moderation({
  profiles,
  userId,
}: {
  profiles: { id: string; full_name: string }[];
  userId?: string | undefined;
}) {
  const qc = useQueryClient();
  const reports = useQuery(reportsQuery);
  const posts = useQuery(postsQuery);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [view, setView] = useState<"open" | "handled">("open");

  const act = useMutation({
    mutationFn: async ({
      reportId,
      postId,
      decision,
      note,
    }: {
      reportId: string;
      postId: string | null;
      decision: "approved" | "deleted";
      note: string;
    }) => {
      if (postId) {
        const { error } = await supabase
          .from("posts")
          .update({ removed: decision === "deleted" })
          .eq("id", postId);
        if (error) throw error;
      }
      const { error } = await supabase
        .from("reports")
        .update({
          resolved: true,
          action: decision,
          admin_note: note,
          resolved_by: userId ?? null,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success(v.decision === "deleted" ? "Post deleted" : "Post approved and kept");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const all = reports.data ?? [];
  const list = all.filter((r) => (view === "open" ? !r.resolved : r.resolved));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["open", "handled"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] tracking-wider uppercase ${
              view === v ? "bg-saffron text-canvas" : "bg-card2 text-fog border-border border"
            }`}
          >
            {v} ({all.filter((r) => (v === "open" ? !r.resolved : r.resolved)).length})
          </button>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {list.map((r) => {
          const post = (posts.data ?? []).find((p) => p.id === r.post_id);
          const author = profiles.find((p) => p.id === post?.author_id)?.full_name ?? "Student";
          const note = notes[r.id] ?? "";
          return (
            <div key={r.id} className="bg-card border-border rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <Chip tone={r.resolved ? "jade" : "rose"}>
                  {r.resolved ? (r.action ?? "resolved").toUpperCase() : "REPORTED"}
                </Chip>
                <span className="text-fog font-mono text-[10px]">{timeAgo(r.created_at)}</span>
              </div>
              <p className="text-fog mt-2.5 font-mono text-[10px] tracking-wider">
                POST BY {author.toUpperCase()}
              </p>
              <p className="border-border bg-card2 mt-1.5 rounded-lg border p-3 text-sm">
                {post?.body ?? "Content unavailable"}
              </p>
              <p className="text-fog mt-2.5 text-xs italic">Reported for: {r.reason || "—"}</p>

              {r.resolved ? (
                r.admin_note && (
                  <p className="text-fog mt-2 text-xs">
                    Admin reason: <span className="text-ink">{r.admin_note}</span>
                  </p>
                )
              ) : (
                <>
                  <Labeled label="Reason for your decision">
                    <textarea
                      rows={2}
                      className={`${inputCls} resize-none`}
                      placeholder="Explain why you are keeping or deleting this post"
                      value={note}
                      onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                    />
                  </Labeled>
                  <div className="mt-3 flex gap-2">
                    <button
                      disabled={!note.trim() || act.isPending}
                      onClick={() =>
                        act.mutate({
                          reportId: r.id,
                          postId: r.post_id,
                          decision: "approved",
                          note: note.trim(),
                        })
                      }
                      className="bg-jade text-canvas flex-1 rounded-lg py-2 font-mono text-[10px] tracking-wider disabled:opacity-40"
                    >
                      APPROVE POST
                    </button>
                    <button
                      disabled={!note.trim() || act.isPending}
                      onClick={() =>
                        act.mutate({
                          reportId: r.id,
                          postId: r.post_id,
                          decision: "deleted",
                          note: note.trim(),
                        })
                      }
                      className="bg-rose text-canvas flex-1 rounded-lg py-2 font-mono text-[10px] tracking-wider disabled:opacity-40"
                    >
                      DELETE POST
                    </button>
                  </div>
                  <p className="text-fog mt-2 text-[11px]">A reason is required before deciding.</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {list.length === 0 && (
        <p className="text-fog text-sm">
          {view === "open" ? "No open reports. All clear." : "Nothing handled yet."}
        </p>
      )}
    </div>
  );
}

/* ---------------- admin profile ---------------- */

function AdminProfile({
  profile,
  userId,
}: {
  profile: Profile | null;
  userId?: string | undefined;
}) {
  const qc = useQueryClient();
  const events = useQuery(eventsQuery);
  const regs = useQuery(registrationsQuery);
  const [f, setF] = useState({
    full_name: profile?.full_name ?? "",
    department: profile?.department ?? "",
    year: profile?.year ?? "",
    student_id: profile?.student_id ?? "",
    bio: profile?.bio ?? "",
  });

  useEffect(() => {
    if (!profile) return;
    setF({
      full_name: profile.full_name ?? "",
      department: profile.department ?? "",
      year: profile.year ?? "",
      student_id: profile.student_id ?? "",
      bio: profile.bio ?? "",
    });
  }, [profile?.id, profile?.full_name, profile?.department, profile?.year, profile?.student_id, profile?.bio]);

  const save = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: f.full_name,
          department: f.department || null,
          year: f.year || null,
          student_id: f.student_id || null,
          bio: f.bio || null,
        })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mine = (events.data ?? [])
    .filter((e) => (e as { created_by?: string | null }).created_by === userId)
    .sort((a, b) => b.event_date.localeCompare(a.event_date));
  const countFor = (id: string) => (regs.data ?? []).filter((r) => r.event_id === id).length;
  const totalAttendees = mine.reduce((n, e) => n + countFor(e.id), 0);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <Panel title="My admin profile" subtitle="Shown to students across the app">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-card2 border-border font-display grid size-14 place-items-center rounded-full border text-lg">
            {initials(f.full_name || "Admin")}
          </div>
          <div>
            <p className="text-sm font-semibold">{f.full_name || "Unnamed admin"}</p>
            <p className="text-saffron font-mono text-[10px] tracking-wider uppercase">Club admin</p>
          </div>
        </div>
        <div className="space-y-3">
          <Labeled label="Full name">
            <input
              className={inputCls}
              value={f.full_name}
              onChange={(e) => setF({ ...f, full_name: e.target.value })}
            />
          </Labeled>
          <div className="grid gap-3 sm:grid-cols-2">
            <Labeled label="Department">
              <input
                className={inputCls}
                value={f.department}
                onChange={(e) => setF({ ...f, department: e.target.value })}
              />
            </Labeled>
            <Labeled label="Year">
              <input
                className={inputCls}
                value={f.year}
                onChange={(e) => setF({ ...f, year: e.target.value })}
              />
            </Labeled>
          </div>
          <Labeled label="Student / staff ID">
            <input
              className={inputCls}
              value={f.student_id}
              onChange={(e) => setF({ ...f, student_id: e.target.value })}
            />
          </Labeled>
          <Labeled label="About you">
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              value={f.bio}
              onChange={(e) => setF({ ...f, bio: e.target.value })}
            />
          </Labeled>
          <button
            disabled={save.isPending}
            onClick={() => save.mutate()}
            className="bg-saffron text-canvas w-full rounded-lg py-2.5 font-mono text-[11px] tracking-wider disabled:opacity-50"
          >
            {save.isPending ? "SAVING…" : "SAVE CHANGES"}
          </button>
        </div>
      </Panel>

      <Panel title="Events I created" subtitle={`${mine.length} events · ${totalAttendees} attendees`}>
        <div className="space-y-2">
          {mine.map((e) => (
            <Link
              key={e.id}
              to="/events/$id"
              params={{ id: e.id }}
              className="bg-card2 border-border hover:border-saffron grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{e.title}</p>
                <p className="text-fog font-mono text-[10px]">
                  {longDate(e.event_date)} · {e.location || "Venue TBC"}
                </p>
              </div>
              <span className="font-display text-lg">{countFor(e.id)}</span>
            </Link>
          ))}
          {mine.length === 0 && (
            <p className="text-fog text-sm">
              You haven&apos;t created any events yet. Use the Events tab to publish your first one.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
