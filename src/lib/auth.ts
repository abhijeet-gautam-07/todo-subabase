// src/lib/auth.ts
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * getUser() now logs both getUser() and getSession() results to clarify why server thinks
 * there is no user even though the browser has cookies.
 */

export type Profile = {
  id: string;
  full_name?: string | null;
  role?: "user" | "admin" | null;
  is_blocked?: boolean | null;
};

export type AuthResult = {
  user: { id: string; email?: string | null } | null;
  profile: Profile | null;
};

export async function getUser(): Promise<AuthResult> {
  const supabase = await getServerSupabase();

  try {
    // Try getUser (reads token from cookies on server)
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      // expected when no session; only log if unexpected
      const message = (userErr as any)?.message ?? "";
      if (!message.toLowerCase().includes("auth session missing")) {
        console.error("supabase.getUser error:", userErr);
      } else {
        console.log("supabase.getUser: no active session (normal if not logged in).");
      }
    } else {
      console.log("supabase.getUser success:", { user: userRes?.user ? { id: userRes.user.id, email: userRes.user.email } : null });
    }

    // Also explicitly call getSession to see what the server client reads
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      console.log("supabase.getSession result:", { hasSession: !!sessionData?.session, sessionErr: sessionErr?.message ?? null });
    } catch (e) {
      console.error("supabase.getSession threw:", e);
    }

    const user = (await supabase.auth.getUser()).data?.user ?? null;
    if (!user) return { user: null, profile: null };

    // fetch profile row
    const { data: profileData, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, role, is_blocked")
      .eq("id", user.id)
      .single();

    if (profileErr) {
      console.error("getUser profile fetch error:", profileErr);
      return { user: { id: user.id, email: user.email }, profile: null };
    }

    return { user: { id: user.id, email: user.email }, profile: profileData as Profile };
  } catch (err) {
    console.error("getUser unexpected error:", err);
    return { user: null, profile: null };
  }
}

export async function requireUser() {
  const result = await getUser();
  console.log("requireUser ->", { user: result.user ? { id: result.user.id } : null, profile: result.profile });
  if (!result.user) redirect("/login");
  return result;
}

export async function requireAdmin() {
  const { user, profile } = await requireUser();
  if (profile?.role !== "admin") redirect("/dashboard");
  return { user, profile };
}
