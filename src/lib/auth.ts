import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  role: "user" | "admin";
  is_blocked: boolean;
};
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function getSession() {
  const supabase = await getServerSupabase();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return session;
}

export async function getUserProfile() {
  const session = await getSession();
  if (!session?.user) {
    return { session: null, profile: null };
  }
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  if (error && error.code !== "PGRST116") {
    throw error;
  }
  return {
    session,
    profile: data as Profile | null,
  };
}

export async function requireUser() {
  const { session, profile } = await getUserProfile();
  if (!session?.user) {
    redirect("/login");
  }
  if (profile?.is_blocked) {
    const supabase = await getServerSupabase();
    await supabase.auth.signOut();
    redirect("/login?blocked=1");
  }
  return { session, profile };
}

export async function requireAdmin() {
  const { session, profile } = await requireUser();
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return { session, profile };
}

