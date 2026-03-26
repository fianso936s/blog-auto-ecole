import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { AppUser } from "../lib/types";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function buildUser(supabaseUser: User): Promise<AppUser> {
  // Tenter de r\u00e9cup\u00e9rer le profil depuis la table profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", supabaseUser.id)
    .single();

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    role: profile?.role || "user",
    full_name: profile?.full_name || supabaseUser.email?.split("@")[0],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!cancelled && session?.user) {
          const u = await buildUser(session.user);
          if (!cancelled) setUser(u);
        }
      } catch {
        // Supabase pas configur\u00e9 ou pas de session
      }
      if (!cancelled) setLoading(false);
    };

    init();

    // UNIQUEMENT pour le logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null); // D\u00e9connexion
      }
      // PAS de else ici \u2014 login() s'en charge
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return false;
    if (data.user) {
      const u = await buildUser(data.user);
      setUser(u);
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
