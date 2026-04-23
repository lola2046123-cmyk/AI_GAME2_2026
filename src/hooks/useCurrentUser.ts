import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAuth, isRemoteSubmissionMode } from "../lib/supabaseClient";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isRemoteSubmissionMode());

  useEffect(() => {
    const sb = getSupabaseAuth();
    if (!sb) {
      setUser(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    void sb.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = sb.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, enabled: isRemoteSubmissionMode() };
}
