"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  workspaceId: string | null;
  userRole: string | null;
  workspaceDetails: { couple_names: string; wedding_date: string } | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  workspaceId: null,
  userRole: null,
  workspaceDetails: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // DEMO MODE BYPASS: If no Supabase URL is set, show a dummy logged-in state so the user can preview the UI.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setUser({ id: "demo-user", email: "demo@vivaah.os" } as User);
      setWorkspaceId("demo-workspace");
      setUserRole("SUPER_ADMIN"); // Changed to SUPER_ADMIN so the user can preview the Admin Portal
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user role and workspace
        const { data: userData } = await supabase
          .from("users")
          .select("workspace_id, role")
          .eq("id", session.user.id)
          .single();
        
        if (userData) {
          setWorkspaceId(userData.workspace_id);
          setUserRole(userData.role);
          const { data: wsData } = await supabase.from("workspaces").select("*").eq("id", userData.workspace_id).single();
          if (wsData) setWorkspaceDetails(wsData);
        } else {
          // If no user record exists, let's create a workspace and make them a SUPER_ADMIN automatically (for testing purposes)
          const { data: newWorkspace } = await supabase
            .from("workspaces")
            .insert([{ couple_names: "My First Couple" }])
            .select()
            .single();

          if (newWorkspace) {
            await supabase.from("users").insert([{
              id: session.user.id,
              workspace_id: newWorkspace.id,
              role: "SUPER_ADMIN"
            }]);
            setWorkspaceId(newWorkspace.id);
            setUserRole("SUPER_ADMIN");
          }
        }
      }

      setIsLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          setWorkspaceId(null);
          setUserRole(null);
        } else {
           const { data: userData } = await supabase
            .from("users")
            .select("workspace_id, role")
            .eq("id", session.user.id)
            .single();
          if (userData) {
            setWorkspaceId(userData.workspace_id);
            setUserRole(userData.role);
            const { data: wsData } = await supabase.from("workspaces").select("*").eq("id", userData.workspace_id).single();
            if (wsData) setWorkspaceDetails(wsData);
          } else {
            const { data: newWorkspace } = await supabase
              .from("workspaces")
              .insert([{ couple_names: "My First Couple" }])
              .select()
              .single();

            if (newWorkspace) {
              await supabase.from("users").insert([{
                id: session.user.id,
                workspace_id: newWorkspace.id,
                role: "SUPER_ADMIN"
              }]);
              setWorkspaceId(newWorkspace.id);
              setUserRole("SUPER_ADMIN");
            }
          }
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setUser(null);
      router.push("/");
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, session, workspaceId, userRole, workspaceDetails, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
