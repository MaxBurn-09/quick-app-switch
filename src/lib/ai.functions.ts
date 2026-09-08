import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }))
    .min(1)
    .max(20),
  context: z.string().max(4000).optional(),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");

    const system = `You are the Searching Eyes campus assistant for a university student community app.
Answer questions about campus events, announcements, club activities, registrations and student life.
Be warm, concise (max 120 words), and practical. If you don't know a specific detail, say so and point the student to the Events or Announcements screen.
${data.context ? `\nCurrent campus data:\n${data.context}` : ""}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        input: [
          { role: "system", content: system },
          ...data.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Too many requests right now — try again in a moment.");
      if (res.status === 402)
        throw new Error("The AI assistant is out of credits. Please add credits to continue.");
      throw new Error(`Assistant unavailable (${res.status}). ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      output_text?: string;
      output?: { type: string; content?: { type: string; text?: string }[] }[];
    };
    const text =
      json.output_text ??
      json.output
        ?.filter((o) => o.type === "message")
        .flatMap((o) => o.content ?? [])
        .filter((c) => c.type === "output_text")
        .map((c) => c.text ?? "")
        .join("\n") ??
      "";

    return { reply: text.trim() || "Sorry, I couldn't come up with an answer." };
  });
