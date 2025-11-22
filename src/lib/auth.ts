// src/lib/auth.ts
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  role: "user" | "admin";
  is_blocked: boolean;
};

export type AuthResult = {
  user: {
    id: string;
    email?: string | null;
    // add other user fields you rely on if needed
  } | null;
  profile: Profile | null;
};

/**
 * Securely gets the authenticated user (validated by Supabase).
 * Returns { user, profile } where either may be null if unauthenticated/missing.
 */
export async function getUser(): Promise<AuthResult> {
  const supabase = await getServerSupabase();

  // IMPORTANT: use getUser() — this validates against Supabase Auth server.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    // treat as unauthenticated — caller can redirect
    return { user: null, profile: null };
  }

  if (!user) {
    return { user: null, profile: null };
  }

  // fetch profile row from your `profiles` table
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_blocked")
    .eq("id", user.id)
    .single();

  if (profileError) {
    // If profile row is missing we treat as no profile (app may create it elsewhere)
    return { user: { id: user.id, email: (user.email as string) ?? null }, profile: null };
  }

  // If user is blocked, sign them out and redirect to login with blocked flag
  if (profileData?.is_blocked) {
    await supabase.auth.signOut();
    redirect("/login?blocked=1");
  }

  const profile: Profile = {
    id: profileData.id,
    full_name: profileData.full_name,
    role: (profileData.role as Profile["role"]) ?? "user",
    is_blocked: !!profileData.is_blocked,
  };

  return { user: { id: user.id, email: (user.email as string) ?? null }, profile };
}

/**
 * Require a logged-in user + profile. Redirects to /login when absent.
 */
export async function requireUser() {
  const { user, profile } = await getUser();
  if (!user || !profile) {
    redirect("/login");
  }
  return { user, profile };
}

/**
 * Require an admin user. Redirects to /dashboard when not admin.
 */
export async function requireAdmin() {
  const { user, profile } = await requireUser();
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return { user, profile };
}
