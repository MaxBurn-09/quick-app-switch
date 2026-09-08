import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Searching Eyes Campus Community" },
      {
        name: "description",
        content:
          "Sign in or create your Searching Eyes account to join campus events, announcements and the student community.",
      },
      { property: "og:title", content: "Sign in — Searching Eyes" },
      {
        property: "og:description",
        content: "Join your university community: events, announcements and student discussions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your account.");
          return;
        }
        toast.success("Welcome to Searching Eyes");
        navigate({ to: "/home" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/home" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="fadeup border-border bg-card/40 w-full max-w-[400px] lg:grid lg:max-w-4xl lg:grid-cols-[1fr_1.1fr] lg:overflow-hidden lg:rounded-[28px] lg:border">
        <div className="bg-card2 border-border relative hidden flex-col justify-between border-r p-10 lg:flex">
          <Link to="/" className="text-fog font-mono text-[10px] tracking-[0.3em] uppercase">
            ← Back
          </Link>
          <div>
            <p className="text-fog font-mono text-[10px] tracking-[0.25em] uppercase">Campus</p>
            <p className="font-display mt-2 text-6xl leading-[0.95] tracking-tight">
              SEARCHING
              <br />
              EYES
            </p>
            <p className="text-fog mt-4 max-w-xs text-sm">
              Events, announcements, activities and a student-only community — one sign-in away.
            </p>
          </div>
          <p className="text-fog font-mono text-[10px] tracking-wider">MEMBERS ONLY</p>
        </div>
        <div className="lg:p-12">
          <Link
            to="/"
            className="text-fog font-mono text-[10px] tracking-[0.3em] uppercase lg:hidden"
          >
            ← Back
          </Link>
        <h1 className="font-display mt-5 text-4xl leading-none tracking-tight">
          {mode === "in" ? "WELCOME BACK" : "JOIN THE CIRCLE"}
        </h1>
        <p className="text-fog mt-2 text-sm">
          Use your university email to access events, announcements and the student community.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-3">
          {mode === "up" && (
            <Field
              label="Full name"
              value={fullName}
              onChange={setFullName}
              placeholder="Aarav Sharma"
              required
            />
          )}
          <Field
            label="University email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@university.edu"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="bg-saffron text-canvas font-display mt-2 w-full rounded-xl py-3 text-lg tracking-wide disabled:opacity-60"
          >
            {busy ? "PLEASE WAIT…" : mode === "in" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="text-fog mt-5 w-full text-center text-sm"
        >
          {mode === "in" ? (
            <>
              New here? <span className="text-saffron">Create an account</span>
            </>
          ) : (
            <>
              Already a member? <span className="text-saffron">Sign in</span>
            </>
          )}
        </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-fog font-mono text-[10px] tracking-[0.2em] uppercase">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card2 border-border text-ink placeholder:text-fog/60 focus:border-saffron mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none"
      />
    </label>
  );
}
