import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { notifyLogin } from "@/lib/login-notify.functions";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session) {
        const key = `dp_login_notified_${session.user.id}_${session.access_token.slice(-12)}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          notifyLogin().catch((err) => console.warn("notifyLogin failed", err));
        }
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, loading };
}