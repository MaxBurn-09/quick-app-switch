CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS TABLE (
  members bigint, members_week bigint,
  registrations bigint, registrations_week bigint,
  posts bigint, posts_week bigint,
  notifications bigint, notifications_week bigint,
  events bigint, open_reports bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.profiles WHERE created_at > now() - interval '7 days'),
    (SELECT count(*) FROM public.event_registrations),
    (SELECT count(*) FROM public.event_registrations WHERE created_at > now() - interval '7 days'),
    (SELECT count(*) FROM public.posts WHERE removed = false),
    (SELECT count(*) FROM public.posts WHERE removed = false AND created_at > now() - interval '7 days'),
    (SELECT count(*) FROM public.notifications),
    (SELECT count(*) FROM public.notifications WHERE created_at > now() - interval '7 days'),
    (SELECT count(*) FROM public.events),
    (SELECT count(*) FROM public.reports WHERE resolved = false)
  WHERE public.is_admin(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.admin_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;