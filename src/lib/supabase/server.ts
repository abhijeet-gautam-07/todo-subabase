// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client adapter for Next.js (Turbopack-friendly).
 * Implements getAll / setAll and also set / remove for backwards compatibility.
 */
export async function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase URL and anon key must be set in environment variables");
  }

  const cookieStore = await cookies();

  const cookieAdapter = {
    // Modern: return an array of { name, value, options? }
    getAll() {
      return cookieStore.getAll().map((c) => ({
        name: c.name,
        value: c.value,
        options: undefined,
      }));
    },

    // Modern: set multiple cookies at once
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
      cookiesToSet.forEach(({ name, value, options }) => {
        cookieStore.set({
          name,
          value,
          path: "/",
          ...(options || {}),
        } as any);
      });
    },

    // Legacy compatibility - set single cookie
    set(name: string, value: string, options?: any) {
      cookieStore.set({
        name,
        value,
        path: "/",
        ...(options || {}),
      } as any);
    },

    // Legacy compatibility - remove cookie by setting expired cookie
    remove(name: string, options?: any) {
      cookieStore.set({
        name,
        value: "",
        maxAge: 0,
        path: "/",
        ...(options || {}),
      } as any);
    },
  };

  return createServerClient(url, anonKey, {
    cookies: cookieAdapter as any,
  });
}
