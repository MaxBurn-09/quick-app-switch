import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip } from "@/components/AppShell";
import { eventsQuery, registrationsQuery } from "@/lib/queries";
import { useMe } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { accentFor, coverFor } from "@/lib/event-images";
import { countdownLabel, longDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/events/$id")({
  head: () => ({
    meta: [
      { title: "Event details — Searching Eyes" },
      { name: "description", content: "Event details, schedule, location and registration." },
      { property: "og:title", content: "Event details — Searching Eyes" },
      { property: "og:description", content: "Event details, schedule, location and registration." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventDetail,
});

function EventDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { user } = useMe();
  const events = useQuery(eventsQuery);
  const regs = useQuery(registrationsQuery);

  const event = (events.data ?? []).find((e) => e.id === id);
  const eventRegs = (regs.data ?? []).filter((r) => r.event_id === id);
  const myReg = eventRegs.find((r) => r.user_id === user?.id);

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      if (myReg) {
        const { error } = await supabase.from("event_registrations").delete().eq("id", myReg.id);
        if (error) throw error;
        return "left";
      }
      const { error } = await supabase
        .from("event_registrations")
        .insert({ event_id: id, user_id: user.id });
      if (error) throw error;
      return "joined";
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["registrations"] });
      toast.success(r === "joined" ? "You're registered!" : "Registration cancelled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!event) return <p className="text-fog py-16 text-center text-sm">Loading event…</p>;

  const full = event.max_participants != null && eventRegs.length >= event.max_participants;

  return (
    <div className="fadeup space-y-4">
      <Link to="/events" className="text-fog font-mono text-[10px] tracking-[0.2em] uppercase">
        ← Events
      </Link>

      <div className="border-border overflow-hidden rounded-2xl border">
        <img
          src={coverFor(event.category, event.cover_image)}
          alt={event.title}
          className="h-48 w-full object-cover"
        />
      </div>

      <div className="flex items-center gap-2">
        <Chip tone={accentFor(event.category)}>{event.category.toUpperCase()}</Chip>
        <Chip tone="jade">{countdownLabel(event.event_date)}</Chip>
      </div>

      <h1 className="font-display text-3xl leading-none tracking-tight">{event.title}</h1>
      <p className="text-fog text-sm whitespace-pre-line">{event.description}</p>

      <div className="bg-card border-border space-y-2 rounded-2xl border p-4 text-sm">
        <Row label="DATE" value={longDate(event.event_date)} />
        <Row
          label="TIME"
          value={[event.start_time, event.end_time].filter(Boolean).join(" – ") || "TBA"}
        />
        <Row label="VENUE" value={event.location} />
        <Row label="ORGANIZER" value={event.organizer} />
        <Row
          label="SEATS"
          value={
            event.max_participants
              ? `${eventRegs.length} / ${event.max_participants}`
              : `${eventRegs.length} registered`
          }
        />
      </div>

      <button
        onClick={() => toggle.mutate()}
        disabled={toggle.isPending || (full && !myReg)}
        className={`font-display w-full rounded-xl py-3 text-lg tracking-wide disabled:opacity-60 ${
          myReg ? "bg-card2 text-ink border-border border" : "bg-saffron text-canvas"
        }`}
      >
        {myReg ? "CANCEL REGISTRATION" : full ? "EVENT FULL" : "REGISTER NOW"}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-fog font-mono text-[10px] tracking-wider">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
