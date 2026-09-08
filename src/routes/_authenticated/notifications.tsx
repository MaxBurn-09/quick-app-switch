import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Chip } from "@/components/AppShell";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Searching Eyes" },
      {
        name: "description",
        content: "Event reminders, announcement alerts and community replies in one place.",
      },
      { property: "og:title", content: "Notifications — Searching Eyes" },
      { property: "og:description", content: "Reminders, alerts and replies from your campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const notifications = useQuery(notificationsQuery);
  const list = notifications.data ?? [];

  const markAll = useMutation({
    mutationFn: async () => {
      const ids = list.filter((n) => !n.read).map((n) => n.id);
      if (!ids.length) return;
      const { error } = await supabase.from("notifications").update({ read: true }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All caught up");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="fadeup space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h1 className="font-display truncate text-3xl leading-none tracking-tight sm:text-4xl">
          NOTIFICATIONS
        </h1>
        <button
          onClick={() => markAll.mutate()}
          className="bg-card2 shrink-0 rounded-lg px-3 py-2 font-mono text-[10px] tracking-wider"
        >
          MARK ALL READ
        </button>
      </div>

      <div className="space-y-2">
        {list.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read && markOne.mutate(n.id)}
            className={`bg-card border-border block w-full rounded-xl border p-4 text-left ${
              n.read ? "opacity-60" : "border-l-saffron border-l-4"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <Chip tone={n.kind === "event" ? "sky" : n.kind === "alert" ? "rose" : "saffron"}>
                {n.kind.toUpperCase()}
              </Chip>
              <span className="text-fog font-mono text-[10px]">{timeAgo(n.created_at)}</span>
            </div>
            <p className="mt-2 text-sm font-semibold">{n.title}</p>
            <p className="text-fog text-xs">{n.body}</p>
          </button>
        ))}
        {list.length === 0 && (
          <p className="text-fog py-16 text-center text-sm">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
