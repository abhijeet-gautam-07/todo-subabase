"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // NOTE: cookies() may be async in your Next.js types/environment — await it.
  const cookieStore = await cookies();

  const supabase = createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set({
            name,
            value,
            ...options,
          });
        });
      },
    },
  });

  // Try to sign out using supabase API (revokes refresh tokens)
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Supabase signOut error:", err);
  }

  // Ensure any Supabase cookies are removed (names start with "sb-")
  try {
    const allCookies = cookieStore.getAll();
    for (const c of allCookies) {
      if (c.name.startsWith("sb-") || c.name === "sb-auth-token" || c.name === "sb-refresh-token") {
        try {
          cookieStore.delete(c.name);
        } catch (e) {
          // ignore individual delete errors
        }
      }
    }
  } catch (e) {
    // If cookieStore.getAll() isn't available for some reason, fallback: try to delete common names directly
    try {
      cookieStore.delete("sb-auth-token");
      cookieStore.delete("sb-refresh-token");
    } catch (_) {}
  }

  redirect("/login");
}
