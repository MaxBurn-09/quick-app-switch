import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { adminStatsQuery, eventsQuery, postsQuery, reportsQuery } from "@/lib/queries";
import { Chip } from "@/components/AppShell";
import { longDate, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin tools — Searching Eyes" },
      {
        name: "description",
        content: "Create campus events and announcements and review reported community posts.",
      },
      { property: "og:title", content: "Admin tools — Searching Eyes" },
      { property: "og:description", content: "Manage events, announcements and moderation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const TABS = ["dashboard", "events", "announcements", "moderation"] as const;

function AdminPage() {
  const { isAdmin, user, profiles } = useMe();
  const [tab, setTab] = useState<(typeof TABS)[number]>("dashboard");

  if (!isAdmin) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-2xl tracking-tight">ADMIN ONLY</h1>
        <p className="text-fog mt-2 text-sm">
          This area is reserved for club and super admins.
        </p>
      </div>
    );
  }

  return (
    <div className="fadeup space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-fog font-mono text-[10px] tracking-[0.3em] uppercase">Control room</p>
          <h1 className="font-display text-3xl leading-none tracking-tight sm:text-4xl lg:text-5xl">
            ADMIN TOOLS
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase ${
                tab === t ? "bg-saffron text-canvas" : "bg-card2 text-fog"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "dashboard" && <Dashboard />}
      {tab === "events" && <EventForm userId={user?.id} />}
      {tab === "announcements" && <AnnouncementForm userId={user?.id} />}
      {tab === "moderation" && <Moderation profiles={profiles} />}
    </div>
  );
}

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
      <p className={`mt-3 font-mono text-[10px] tracking-wider ${tone}`}>
        +{week} THIS WEEK
      </p>
    </div>
  );
}

function Dashboard() {
  const stats = useQuery(adminStatsQuery);
  const s = stats.data;

  if (stats.isLoading) return <p className="text-fog text-sm">Loading numbers…</p>;
  if (!s) return <p className="text-fog text-sm">No statistics available.</p>;

  const bars: { label: string; value: number; week: number }[] = [
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

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="bg-card border-border rounded-2xl border p-5">
          <h2 className="font-display text-lg tracking-tight">Overall activity</h2>
          <div className="mt-4 space-y-4">
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
                    className="bg-saffron h-full rounded-full"
                    style={{ width: `${Math.round((b.value / peak) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border-border space-y-3 rounded-2xl border p-5">
          <h2 className="font-display text-lg tracking-tight">At a glance</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-fog">Events published</span>
            <span className="font-semibold">{s.events}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-fog">Open reports</span>
            <span className={s.open_reports > 0 ? "text-rose font-semibold" : "font-semibold"}>
              {s.open_reports}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-fog">New members this week</span>
            <span className="font-semibold">{s.members_week}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-fog">Sign-ups this week</span>
            <span className="font-semibold">{s.registrations_week}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-fog font-mono text-[10px] tracking-wider uppercase">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "bg-card2 border-border focus:border-saffron mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none";

function EventForm({ userId }: { userId?: string | undefined }) {
  const qc = useQueryClient();
  const events = useQuery(eventsQuery);
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

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="bg-card border-border space-y-3 rounded-2xl border p-4">
        <h2 className="font-display text-lg tracking-tight">New event</h2>
        <Labeled label="Title">
          <input
            className={inputCls}
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
        </Labeled>
        <Labeled label="Description">
          <textarea
            rows={3}
            className={`${inputCls} resize-none`}
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
              value={f.location}
              onChange={(e) => setF({ ...f, location: e.target.value })}
            />
          </Labeled>
          <Labeled label="Seat limit">
            <input
              type="number"
              className={inputCls}
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
          Feature on home screen
        </label>
        <button
          disabled={!f.title || !f.event_date || create.isPending}
          onClick={() => create.mutate()}
          className="bg-saffron text-canvas w-full rounded-lg py-2.5 font-mono text-[11px] tracking-wider disabled:opacity-50"
        >
          PUBLISH EVENT
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-lg tracking-tight">Existing events</h2>
        {(events.data ?? []).map((e) => (
          <div
            key={e.id}
            className="bg-card border-border grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{e.title}</p>
              <p className="text-fog font-mono text-[10px]">{longDate(e.event_date)}</p>
            </div>
            <button
              onClick={() => remove.mutate(e.id)}
              className="text-rose shrink-0 font-mono text-[10px]"
            >
              DELETE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="bg-card border-border max-w-xl space-y-3 rounded-2xl border p-4">
      <h2 className="font-display text-lg tracking-tight">New announcement</h2>
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
  );
}

function Moderation({ profiles }: { profiles: { id: string; full_name: string }[] }) {
  const qc = useQueryClient();
  const reports = useQuery(reportsQuery);
  const posts = useQuery(postsQuery);

  const act = useMutation({
    mutationFn: async ({
      reportId,
      postId,
      remove,
    }: {
      reportId: string;
      postId: string | null;
      remove: boolean;
    }) => {
      if (remove && postId) {
        const { error } = await supabase.from("posts").update({ removed: true }).eq("id", postId);
        if (error) throw error;
      }
      const { error } = await supabase.from("reports").update({ resolved: true }).eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Report handled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const open = (reports.data ?? []).filter((r) => !r.resolved);

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg tracking-tight">Reported content</h2>
      {open.map((r) => {
        const post = (posts.data ?? []).find((p) => p.id === r.post_id);
        const author = profiles.find((p) => p.id === post?.author_id)?.full_name ?? "Student";
        return (
          <div key={r.id} className="bg-card border-border rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <Chip tone="rose">REPORTED</Chip>
              <span className="text-fog font-mono text-[10px]">{timeAgo(r.created_at)}</span>
            </div>
            <p className="text-fog mt-2 font-mono text-[10px]">BY {author.toUpperCase()}</p>
            <p className="mt-1 text-sm">{post?.body ?? "Content unavailable"}</p>
            <p className="text-fog mt-2 text-xs italic">Reason: {r.reason}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => act.mutate({ reportId: r.id, postId: r.post_id, remove: true })}
                className="bg-rose text-canvas flex-1 rounded-lg py-2 font-mono text-[10px] tracking-wider"
              >
                REMOVE POST
              </button>
              <button
                onClick={() => act.mutate({ reportId: r.id, postId: r.post_id, remove: false })}
                className="bg-card2 flex-1 rounded-lg py-2 font-mono text-[10px] tracking-wider"
              >
                DISMISS
              </button>
            </div>
          </div>
        );
      })}
      {open.length === 0 && <p className="text-fog text-sm">No open reports. All clear.</p>}
    </div>
  );
}
