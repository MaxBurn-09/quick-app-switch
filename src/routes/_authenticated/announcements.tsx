import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { announcementsQuery } from "@/lib/queries";
import { Chip } from "@/components/AppShell";
import { longDate, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Searching Eyes Campus Community" },
      {
        name: "description",
        content: "Official campus announcements, urgent notices and club updates for students.",
      },
      { property: "og:title", content: "Announcements — Searching Eyes" },
      { property: "og:description", content: "Urgent notices and official campus updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const announcements = useQuery(announcementsQuery);
  const list = announcements.data ?? [];
  const urgent = list.filter((a) => a.priority === "urgent");
  const rest = list.filter((a) => a.priority !== "urgent");

  return (
    <div className="fadeup space-y-6">
      <h1 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
        ANNOUNCEMENTS
      </h1>

      {urgent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-rose font-mono text-[11px] tracking-[0.2em] uppercase">Urgent</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {urgent.map((a) => (
              <Card key={a.id} a={a} urgent />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-fog font-mono text-[11px] tracking-[0.2em] uppercase">All updates</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {rest.map((a) => (
            <Card key={a.id} a={a} />
          ))}
        </div>
        {list.length === 0 && <p className="text-fog text-sm">No announcements yet.</p>}
      </section>
    </div>
  );
}

function Card({
  a,
  urgent,
}: {
  a: { id: string; title: string; body: string; priority: string; published_at: string };
  urgent?: boolean;
}) {
  return (
    <article
      className={`bg-card border-border rounded-2xl border p-4 ${urgent ? "border-l-rose border-l-4" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Chip tone={urgent ? "rose" : "sky"}>{a.priority.toUpperCase()}</Chip>
        <span className="text-fog font-mono text-[10px]">{timeAgo(a.published_at)}</span>
      </div>
      <h3 className="mt-2 text-base font-semibold">{a.title}</h3>
      <p className="text-fog mt-1 text-sm whitespace-pre-line">{a.body}</p>
      <p className="text-fog mt-3 font-mono text-[10px]">{longDate(a.published_at)}</p>
    </article>
  );
}
