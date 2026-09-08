import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export type EventRow = {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  organizer: string;
  category: string;
  status: string;
  max_participants: number | null;
  featured: boolean;
};

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: () =>
    unwrap<EventRow[]>(
      supabase.from("events").select("*").order("event_date", { ascending: true }),
    ),
});

export const registrationsQuery = queryOptions({
  queryKey: ["registrations"],
  queryFn: () =>
    unwrap<{ id: string; event_id: string; user_id: string }[]>(
      supabase.from("event_registrations").select("id,event_id,user_id"),
    ),
});

export const announcementsQuery = queryOptions({
  queryKey: ["announcements"],
  queryFn: () =>
    unwrap<
      {
        id: string;
        title: string;
        body: string;
        priority: string;
        published_at: string;
      }[]
    >(supabase.from("announcements").select("*").order("published_at", { ascending: false })),
});

export const activitiesQuery = queryOptions({
  queryKey: ["activities"],
  queryFn: () =>
    unwrap<
      {
        id: string;
        title: string;
        description: string;
        activity_date: string;
        category: string;
        participants: number | null;
        outcome: string | null;
      }[]
    >(supabase.from("activities").select("*").order("activity_date", { ascending: false })),
});

export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () =>
    unwrap<{ id: string; author_id: string; body: string; removed: boolean; created_at: string }[]>(
      supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(60),
    ),
});

export const likesQuery = queryOptions({
  queryKey: ["post_likes"],
  queryFn: () =>
    unwrap<{ post_id: string; user_id: string }[]>(
      supabase.from("post_likes").select("post_id,user_id"),
    ),
});

export const commentsQuery = queryOptions({
  queryKey: ["post_comments"],
  queryFn: () =>
    unwrap<
      { id: string; post_id: string; author_id: string; body: string; created_at: string }[]
    >(supabase.from("post_comments").select("*").order("created_at", { ascending: true })),
});

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  student_id: string | null;
  department: string | null;
  year: string | null;
  bio: string | null;
  interests: string[];
  created_at: string;
};

export const profilesQuery = queryOptions({
  queryKey: ["profiles"],
  queryFn: () => unwrap<Profile[]>(supabase.from("profiles").select("*")),
});

export const rolesQuery = queryOptions({
  queryKey: ["user_roles"],
  queryFn: () =>
    unwrap<{ user_id: string; role: string }[]>(supabase.from("user_roles").select("user_id,role")),
});

export const notificationsQuery = queryOptions({
  queryKey: ["notifications"],
  queryFn: () =>
    unwrap<
      { id: string; title: string; body: string; kind: string; read: boolean; created_at: string }[]
    >(supabase.from("notifications").select("*").order("created_at", { ascending: false })),
});

export type AdminStats = {
  members: number;
  members_week: number;
  registrations: number;
  registrations_week: number;
  posts: number;
  posts_week: number;
  notifications: number;
  notifications_week: number;
  events: number;
  open_reports: number;
};

export const adminStatsQuery = queryOptions({
  queryKey: ["admin_stats"],
  queryFn: async (): Promise<AdminStats | null> => {
    const { data, error } = await supabase.rpc("admin_stats");
    if (error) throw new Error(error.message);
    return (data?.[0] as AdminStats | undefined) ?? null;
  },
});

export const reportsQuery = queryOptions({
  queryKey: ["reports"],
  queryFn: () =>
    unwrap<
      {
        id: string;
        post_id: string | null;
        comment_id: string | null;
        reporter_id: string;
        reason: string;
        resolved: boolean;
        created_at: string;
      }[]
    >(supabase.from("reports").select("*").order("created_at", { ascending: false })),
});
