import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { activitiesQuery } from "@/lib/queries";
import { Chip } from "@/components/AppShell";
import { longDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({
    meta: [
      { title: "Activity records — Searching Eyes" },
      {
        name: "description",
        content: "A record of completed club activities, outcomes and student participation.",
      },
      { property: "og:title", content: "Activity records — Searching Eyes" },
      { property: "og:description", content: "Completed club activities, outcomes and turnout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const activities = useQuery(activitiesQuery);
  const list = activities.data ?? [];
  const categories = ["all", ...Array.from(new Set(list.map((a) => a.category)))];
  const [cat, setCat] = useState("all");
  const shown = cat === "all" ? list : list.filter((a) => a.category === cat);

  return (
    <div className="fadeup space-y-5">
      <div>
        <h1 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
          ACTIVITY RECORDS
        </h1>
        <p className="text-fog mt-1 text-sm">What the community has accomplished so far.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase ${
              cat === c ? "bg-saffron text-canvas" : "bg-card2 text-fog"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {shown.map((a) => (
          <article key={a.id} className="bg-card border-border rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <Chip tone="jade">{a.category.toUpperCase()}</Chip>
              <span className="text-fog font-mono text-[10px]">{longDate(a.activity_date)}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold">{a.title}</h3>
            <p className="text-fog mt-1 text-sm">{a.description}</p>
            <div className="text-fog mt-3 flex flex-wrap gap-4 font-mono text-[10px]">
              {a.participants != null && <span>{a.participants} PARTICIPANTS</span>}
              {a.outcome && <span className="text-jade">{a.outcome}</span>}
            </div>
          </article>
        ))}
        {shown.length === 0 && <p className="text-fog text-sm">No activity records yet.</p>}
      </div>
    </div>
  );
}
