import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMe } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { eventsQuery, postsQuery, registrationsQuery } from "@/lib/queries";
import { initials, longDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Searching Eyes" },
      {
        name: "description",
        content: "Manage your student profile, interests and the events you have joined.",
      },
      { property: "og:title", content: "Your profile — Searching Eyes" },
      { property: "og:description", content: "Student profile, interests and joined events." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, roles, isAdmin } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const events = useQuery(eventsQuery);
  const regs = useQuery(registrationsQuery);
  const posts = useQuery(postsQuery);

  const [form, setForm] = useState({
    full_name: "",
    student_id: "",
    department: "",
    year: "",
    bio: "",
    interests: "",
  });
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      student_id: profile.student_id ?? "",
      department: profile.department ?? "",
      year: profile.year ?? "",
      bio: profile.bio ?? "",
      interests: (profile.interests ?? []).join(", "),
    });
  }, [profile?.id]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          student_id: form.student_id || null,
          department: form.department || null,
          year: form.year || null,
          bio: form.bio || null,
          interests: form.interests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      setEdit(false);
      toast.success("Profile updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const myRegs = (regs.data ?? []).filter((r) => r.user_id === user?.id);
  const myEvents = (events.data ?? []).filter((e) => myRegs.some((r) => r.event_id === e.id));
  const myPosts = (posts.data ?? []).filter((p) => p.author_id === user?.id && !p.removed);

  return (
    <div className="fadeup space-y-5">
      <div className="flex items-center gap-4">
        <div className="bg-card2 text-saffron font-display grid size-16 place-items-center rounded-full text-xl">
          {initials(profile?.full_name)}
        </div>
        <div className="min-w-0">
          <h1 className="font-display truncate text-2xl leading-none tracking-tight">
            {profile?.full_name ?? "Student"}
          </h1>
          <p className="text-fog truncate text-xs">{user?.email}</p>
          <p className="text-saffron font-mono text-[10px] tracking-wider uppercase">
            {roles.join(" · ") || "student"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card border-border rounded-xl border p-3 text-center">
          <p className="font-display text-jade text-2xl leading-none">{myEvents.length}</p>
          <p className="text-fog mt-1 font-mono text-[9px]">EVENTS JOINED</p>
        </div>
        <div className="bg-card border-border rounded-xl border p-3 text-center">
          <p className="font-display text-sky text-2xl leading-none">{myPosts.length}</p>
          <p className="text-fog mt-1 font-mono text-[9px]">POSTS SHARED</p>
        </div>
      </div>

      {edit ? (
        <div className="bg-card border-border space-y-3 rounded-2xl border p-4">
          {(
            [
              ["full_name", "Full name"],
              ["student_id", "Student ID"],
              ["department", "Department"],
              ["year", "Year"],
              ["interests", "Interests (comma separated)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-fog font-mono text-[10px] tracking-wider uppercase">
                {label}
              </span>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="bg-card2 border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              />
            </label>
          ))}
          <label className="block">
            <span className="text-fog font-mono text-[10px] tracking-wider uppercase">Bio</span>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="bg-card2 border-border mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none"
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => save.mutate()}
              className="bg-saffron text-canvas flex-1 rounded-lg py-2.5 font-mono text-[11px] tracking-wider"
            >
              SAVE
            </button>
            <button
              onClick={() => setEdit(false)}
              className="bg-card2 flex-1 rounded-lg py-2.5 font-mono text-[11px] tracking-wider"
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card border-border space-y-2 rounded-2xl border p-4 text-sm">
          <Row label="STUDENT ID" value={profile?.student_id ?? "—"} />
          <Row label="DEPARTMENT" value={profile?.department ?? "—"} />
          <Row label="YEAR" value={profile?.year ?? "—"} />
          {profile?.bio && <p className="text-fog pt-1 text-xs">{profile.bio}</p>}
          {!!profile?.interests?.length && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.interests.map((i) => (
                <span key={i} className="bg-card2 text-fog rounded px-2 py-0.5 font-mono text-[10px]">
                  {i}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => setEdit(true)}
            className="bg-card2 mt-2 w-full rounded-lg py-2.5 font-mono text-[11px] tracking-wider"
          >
            EDIT PROFILE
          </button>
        </div>
      )}

      <section>
        <h2 className="font-display mb-2 text-lg tracking-tight">My events</h2>
        <div className="space-y-2">
          {myEvents.map((e) => (
            <Link
              key={e.id}
              to="/events/$id"
              params={{ id: e.id }}
              className="bg-card border-border block rounded-xl border p-3"
            >
              <p className="text-sm font-semibold">{e.title}</p>
              <p className="text-fog font-mono text-[10px]">{longDate(e.event_date)}</p>
            </Link>
          ))}
          {myEvents.length === 0 && (
            <p className="text-fog text-sm">You haven't joined any events yet.</p>
          )}
        </div>
      </section>

      <div className="space-y-2">
        {isAdmin && (
          <Link
            to="/admin"
            className="bg-card2 border-border block rounded-xl border py-3 text-center text-sm"
          >
            Admin tools
          </Link>
        )}
        <Link
          to="/activities"
          className="bg-card2 border-border block rounded-xl border py-3 text-center text-sm"
        >
          Club activity records
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
          className="border-rose/40 text-rose w-full rounded-xl border py-3 text-sm"
        >
          Sign out
        </button>
      </div>
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
