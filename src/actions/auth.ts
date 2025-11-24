// src/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSupabase } from "@/lib/supabase/server";

type ActionState = { error?: string };

/**
 * loginAction - enhanced logging to debug why the server thinks session is missing.
 */
export async function loginAction(
  prevState: void | ActionState,
  formData: FormData
): Promise<void | ActionState> {
  try {
    const email = getString(formData.get("email"));
    const password = getString(formData.get("password"));

    if (!email || !isValidEmail(email)) return { error: "Please enter a valid email." };
    if (!password) return { error: "Please enter a password." };

    // Log incoming cookies as seen by this server action
    try {
      const cookieStore = await cookies();
      console.log("[loginAction] request cookies:", cookieStore.getAll().map(c => ({ name: c.name, valuePresent: !!c.value })));
    } catch (e) {
      console.error("[loginAction] cookies() threw:", e);
    }

    const supabase = await getServerSupabase();

    // Attempt sign-in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("[loginAction] signIn result:", { user: signInData?.user ?? null, signInError: signInError?.message ?? null });

    if (signInError) {
      return { error: signInError.message || "Sign in failed." };
    }

    // Confirm session on server (cookies should have been written)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("[loginAction] getSession result:", { session: !!sessionData?.session, sessionError: sessionError?.message ?? null });
      if (sessionError) {
        console.error("loginAction getSession error:", sessionError);
        return { error: "Signed in but cannot read session on server." };
      }

      const user = sessionData?.session?.user ?? signInData?.user ?? null;
      if (!user) {
        console.warn("[loginAction] no active session user after signIn");
        return { error: "Sign in succeeded but no active session was found (cookies not set)." };
      }
    } catch (e) {
      console.error("[loginAction] getSession threw:", e);
      return { error: "Unable to confirm session. Check server logs." };
    }

    // success -> redirect
    console.log("[loginAction] successful -> redirect to /dashboard");
    redirect("/dashboard");
  } catch (err) {
    console.error("[loginAction] unexpected error:", err);
    return { error: "Internal server error during login. Check server logs." };
  }
}

/**
 * signupAction - keep same defensive behavior, but log session result
 */
export async function signupAction(
  prevState: void | ActionState,
  formData: FormData
): Promise<void | ActionState> {
  try {
    const fullName = getString(formData.get("fullName"));
    const email = getString(formData.get("email"));
    const password = getString(formData.get("password"));
    const makeAdmin = getCheckboxValue(formData.get("makeAdmin"));

    if (!fullName) return { error: "Full name is required." };
    if (!email || !isValidEmail(email)) return { error: "Valid email required." };
    if (!password || password.length < 6) return { error: "Password must be at least 6 characters." };

    // Log incoming cookies for the signup request
    try {
      const cookieStore = await cookies();
      console.log("[signupAction] request cookies:", cookieStore.getAll().map(c => ({ name: c.name, valuePresent: !!c.value })));
    } catch (e) {
      console.error("[signupAction] cookies() threw:", e);
    }

    const supabase = await getServerSupabase();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("[signupAction] signUp result:", { user: signUpData?.user ?? null, signUpError: signUpError?.message ?? null });

    if (signUpError) {
      return { error: signUpError.message || "Unable to create account." };
    }

    const user = signUpData?.user ?? null;

    if (user?.id) {
      try {
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: fullName,
          role: makeAdmin ? "admin" : "user",
          is_blocked: false,
        });
      } catch (e) {
        console.error("[signupAction] profile insert failed:", e);
      }
    }

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("[signupAction] getSession result:", { session: !!sessionData?.session, sessionError: sessionError?.message ?? null });
      if (!sessionData?.session?.user) {
        return {
          error:
            "Account created. Please verify your email before signing in (check spam).",
        };
      }
    } catch (e) {
      console.error("[signupAction] getSession threw:", e);
      return { error: "Unable to confirm session after signup. Check server logs." };
    }

    redirect("/dashboard");
  } catch (err) {
    console.error("[signupAction] unexpected error:", err);
    return { error: "Internal server error during signup. Check server logs." };
  }
}

/* helpers */
function getString(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}
function isValidEmail(e: string) {
  return /\S+@\S+\.\S+/.test(e);
}
function getCheckboxValue(v: FormDataEntryValue | null) {
  return v === "on" || v === "true";
}
