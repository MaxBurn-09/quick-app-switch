import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commentsQuery, likesQuery, postsQuery } from "@/lib/queries";
import { useMe } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { initials, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "Community — Searching Eyes Campus Community" },
      {
        name: "description",
        content: "Share updates, ask questions and talk with students across your campus.",
      },
      { property: "og:title", content: "Community — Searching Eyes" },
      { property: "og:description", content: "Student posts, replies and campus conversations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const qc = useQueryClient();
  const { user, profiles } = useMe();
  const posts = useQuery(postsQuery);
  const likes = useQuery(likesQuery);
  const comments = useQuery(commentsQuery);
  const [body, setBody] = useState("");
  const [openComments, setOpenComments] = useState<string | null>(null);

  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.full_name ?? "Student";

  const invalidate = (key: string) => qc.invalidateQueries({ queryKey: [key] });

  const createPost = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase.from("posts").insert({ author_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      invalidate("posts");
      toast.success("Posted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Sign in first");
      const liked = (likes.data ?? []).some((l) => l.post_id === postId && l.user_id === user.id);
      if (liked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => invalidate("post_likes"),
    onError: (e: Error) => toast.error(e.message),
  });

  const addComment = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase
        .from("post_comments")
        .insert({ post_id: postId, author_id: user.id, body: text });
      if (error) throw error;
    },
    onSuccess: () => invalidate("post_comments"),
    onError: (e: Error) => toast.error(e.message),
  });

  const report = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase
        .from("reports")
        .insert({ post_id: postId, reporter_id: user.id, reason: "Reported by member" });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Reported to moderators"),
    onError: (e: Error) => toast.error(e.message),
  });

  const removeOwn = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate("posts");
      toast.success("Post deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visible = (posts.data ?? []).filter((p) => !p.removed);

  return (
    <div className="fadeup space-y-4">
      <h1 className="font-display text-3xl leading-none tracking-tight">COMMUNITY</h1>

      <div className="bg-card border-border rounded-2xl border p-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Share something with your campus…"
          className="placeholder:text-fog/60 w-full resize-none bg-transparent text-sm outline-none"
        />
        <div className="flex justify-end">
          <button
            disabled={!body.trim() || createPost.isPending}
            onClick={() => createPost.mutate()}
            className="bg-saffron text-canvas rounded-lg px-4 py-1.5 font-mono text-[11px] tracking-wider disabled:opacity-50"
          >
            POST
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((p) => {
          const postLikes = (likes.data ?? []).filter((l) => l.post_id === p.id);
          const liked = postLikes.some((l) => l.user_id === user?.id);
          const postComments = (comments.data ?? []).filter((c) => c.post_id === p.id);
          return (
            <article key={p.id} className="bg-card border-border rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-card2 text-saffron grid size-9 place-items-center rounded-full font-mono text-[11px]">
                  {initials(nameOf(p.author_id))}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{nameOf(p.author_id)}</p>
                  <p className="text-fog font-mono text-[10px]">{timeAgo(p.created_at)}</p>
                </div>
                {p.author_id === user?.id ? (
                  <button
                    onClick={() => removeOwn.mutate(p.id)}
                    className="text-fog font-mono text-[10px]"
                  >
                    DELETE
                  </button>
                ) : (
                  <button
                    onClick={() => report.mutate(p.id)}
                    className="text-fog font-mono text-[10px]"
                  >
                    REPORT
                  </button>
                )}
              </div>

              <p className="mt-3 text-sm whitespace-pre-line">{p.body}</p>

              <div className="text-fog mt-3 flex gap-4 font-mono text-[11px]">
                <button
                  onClick={() => toggleLike.mutate(p.id)}
                  className={liked ? "text-rose" : undefined}
                >
                  ♥ {postLikes.length}
                </button>
                <button onClick={() => setOpenComments(openComments === p.id ? null : p.id)}>
                  ✎ {postComments.length}
                </button>
              </div>

              {openComments === p.id && (
                <div className="border-border mt-3 space-y-2 border-t pt-3">
                  {postComments.map((c) => (
                    <div key={c.id} className="text-sm">
                      <span className="text-saffron font-mono text-[10px]">
                        {nameOf(c.author_id)}
                      </span>
                      <p className="text-fog">{c.body}</p>
                    </div>
                  ))}
                  <CommentBox
                    onSubmit={(text) => addComment.mutate({ postId: p.id, text })}
                  />
                </div>
              )}
            </article>
          );
        })}
        {visible.length === 0 && (
          <p className="text-fog py-10 text-center text-sm">No posts yet — start the conversation.</p>
        )}
      </div>
    </div>
  );
}

function CommentBox({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text);
        setText("");
      }}
      className="flex gap-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply…"
        className="bg-card2 border-border placeholder:text-fog/60 flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
      />
      <button className="bg-card2 text-ink rounded-lg px-3 font-mono text-[10px]">SEND</button>
    </form>
  );
}
