import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { askAssistant } from "@/lib/ai.functions";
import { announcementsQuery, eventsQuery } from "@/lib/queries";
import { longDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Searching Eyes Campus Community" },
      {
        name: "description",
        content: "Ask the campus assistant about events, deadlines, clubs and student life.",
      },
      { property: "og:title", content: "AI Assistant — Searching Eyes" },
      { property: "og:description", content: "Instant answers about campus events and activities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const PROMPTS = [
  "What events are happening this week?",
  "How do I register for a workshop?",
  "Any urgent announcements?",
  "Suggest a club for a first-year CS student",
];

type Msg = { role: "user" | "assistant"; content: string };

function AssistantPage() {
  const ask = useServerFn(askAssistant);
  const events = useQuery(eventsQuery);
  const announcements = useQuery(announcementsQuery);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const context = [
    "Upcoming events:",
    ...(events.data ?? [])
      .slice(0, 8)
      .map((e) => `- ${e.title} (${e.category}) on ${longDate(e.event_date)} at ${e.location}`),
    "Announcements:",
    ...(announcements.data ?? [])
      .slice(0, 5)
      .map((a) => `- [${a.priority}] ${a.title}: ${a.body.slice(0, 140)}`),
  ].join("\n");

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ data: { messages: next.slice(-10), context } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assistant unavailable");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fadeup flex min-h-[70vh] flex-col">
      <h1 className="font-display text-3xl leading-none tracking-tight">CAMPUS AI</h1>
      <p className="text-fog mt-1 text-sm">
        Ask anything about events, clubs, deadlines and student life.
      </p>

      <div className="mt-4 flex-1 space-y-3">
        {messages.length === 0 && (
          <div className="grid gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="bg-card border-border rounded-xl border p-3 text-left text-sm"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
              m.role === "user"
                ? "bg-saffron text-canvas ml-auto"
                : "bg-card border-border border whitespace-pre-line"
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && <p className="text-fog font-mono text-[11px]">thinking…</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="bg-canvas sticky bottom-0 flex gap-2 pt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the campus assistant…"
          className="bg-card2 border-border placeholder:text-fog/60 focus:border-saffron flex-1 rounded-xl border px-4 py-3 text-sm outline-none"
        />
        <button
          disabled={busy}
          className="bg-saffron text-canvas rounded-xl px-4 font-mono text-[11px] tracking-wider disabled:opacity-50"
        >
          SEND
        </button>
      </form>
    </div>
  );
}
