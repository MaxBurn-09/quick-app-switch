import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { CAMPUS_DOMAIN, CAMPUS_EMAIL_MESSAGE, isCampusEmail } from "@/lib/campus";

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
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function google() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { hd: CAMPUS_DOMAIN, prompt: "select_account" },
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      const { data } = await supabase.auth.getUser();
      if (!isCampusEmail(data.user?.email)) {
        await supabase.auth.signOut();
        toast.error(CAMPUS_EMAIL_MESSAGE);
        return;
      }
      navigate({ to: "/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!pendingEmail) return;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
    else toast.success("Confirmation email sent again.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isCampusEmail(email)) {
      toast.error(CAMPUS_EMAIL_MESSAGE);
      return;
    }
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
          setPendingEmail(email);
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
          <p className="text-fog font-mono text-[10px] tracking-wider">
            @{CAMPUS_DOMAIN} ACCOUNTS ONLY · ADMIN ACCESS IS GRANTED BY A SUPER ADMIN
          </p>
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
          Only official college accounts ending in{" "}
          <span className="text-saffron font-mono text-xs">@{CAMPUS_DOMAIN}</span> can sign in.
        </p>

        <form onSubmit={submit} className="stagger mt-7 space-y-3">
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
            label="College email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={`you@${CAMPUS_DOMAIN}`}
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
            className="bg-saffron text-canvas font-display press mt-2 w-full rounded-xl py-3 text-lg tracking-wide transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {busy ? "PLEASE WAIT…" : mode === "in" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        {pendingEmail && (
          <div className="border-border bg-card2 mt-4 rounded-xl border p-3">
            <p className="text-sm">
              We sent a confirmation link to <span className="text-saffron">{pendingEmail}</span>.
              Open it to activate your account, then sign in.
            </p>
            <button onClick={resend} className="text-saffron mt-2 font-mono text-[10px] tracking-wider">
              RESEND EMAIL
            </button>
          </div>
        )}

        <div className="my-5 flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-fog font-mono text-[10px] tracking-[0.2em]">OR</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="border-border bg-card2 hover:border-saffron flex w-full items-center justify-center gap-3 rounded-xl border py-3 text-sm font-semibold transition-colors disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z" />
            <path fill="#34A853" d="M6.6 14.3 5.9 15l-2.5 2A9.9 9.9 0 0 0 12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 1-3.5 1a6 6 0 0 1-5.4-3.8z" />
            <path fill="#FBBC05" d="M3.4 7A9.9 9.9 0 0 0 2.3 12c0 1.8.4 3.5 1.1 5l3.2-2.7a6 6 0 0 1 0-4.6z" />
            <path fill="#4285F4" d="M12 6.2c1.5 0 2.9.5 3.9 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2 9.9 9.9 0 0 0 3.4 7l3.2 2.7A6 6 0 0 1 12 6.2z" />
          </svg>
          Continue with Google
        </button>

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
