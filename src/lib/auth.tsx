import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export type AppRole = "senior" | "junior" | "public";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpEmail: (
    email: string,
    password: string,
    fullName: string,
    role: AppRole,
  ) => Promise<{ error: string | null }>;
  signInGoogle: (role?: AppRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // Defer role fetch
        setTimeout(() => fetchRole(sess.user.id), 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchRole(sess.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchRole(uid: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .limit(1)
      .maybeSingle();
    setRole((data?.role as AppRole) ?? "public");
  }

  const value: AuthCtx = {
    session,
    user,
    role,
    loading,
    async signInEmail(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    async signUpEmail(email, password, fullName, role) {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName, requested_role: role },
        },
      });
      return { error: error?.message ?? null };
    },
    async signInGoogle(role = "public") {
      const result = await lovable.auth.signInWithOAuth("google", {
        extraParams: { requested_role: role },
      });
      if ("error" in result && result.error) {
        return { error: (result.error as Error).message };
      }
      return { error: null };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
