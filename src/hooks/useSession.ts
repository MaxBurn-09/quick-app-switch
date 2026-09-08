import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { profilesQuery, rolesQuery } from "@/lib/queries";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export function useMe() {
  const { user } = useUser();
  const profiles = useQuery(profilesQuery);
  const roles = useQuery(rolesQuery);

  const profile = profiles.data?.find((p) => p.id === user?.id) ?? null;
  const myRoles = roles.data?.filter((r) => r.user_id === user?.id).map((r) => r.role) ?? [];
  const isAdmin = myRoles.includes("club_admin") || myRoles.includes("super_admin");

  return { user, profile, roles: myRoles, isAdmin, profiles: profiles.data ?? [] };
}
