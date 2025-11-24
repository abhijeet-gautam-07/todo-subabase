// src/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: boolean };

/**
 * LOGIN ACTION
 * Signature compatible with useActionState: (prevState, formData) => void | ActionState | Promise<void | ActionState>
 */
export async function loginAction(
  prevState: void | ActionState,
  formData: FormData
): Promise<void | ActionState> {
  try {
    const email = getString(formData.get("email"));
    const password = getString(formData.get("password"));

    if (!email || !isValidEmail(email)) return { error: "Please enter a valid email.", success: false };
    if (!password) return { error: "Please enter a password.", success: false };

    const supabase = await getServerSupabase();

    // Attempt sign-in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return { error: signInError.message || "Sign in failed.", success: false };
    }

    // Confirm session on server (cookies should have been written)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("loginAction getSession error:", sessionError);
      return { error: "Signed in but cannot read session on server.", success: false };
    }

    const user = sessionData?.session?.user ?? signInData?.user ?? null;
    if (!user) {
      return { error: "Sign in succeeded but no active session was found (cookies not set).", success: false };
    }

    // Load profile and check blocked state
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, is_blocked, role")
        .eq("id", user.id)
        .single();

      if (profileErr) {
        // If profile missing, allow sign-in (or change to block) — here we log only.
        console.warn("loginAction: profile fetch error (allowing login):", profileErr);
      } else if (profileData?.is_blocked) {
        // If user is blocked — sign them out to clear cookies & return an error
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error("loginAction: signOut after block failed:", e);
        }
        return { error: "Your account has been blocked. Contact an administrator.", success: false };
      }
    } catch (e) {
      console.error("loginAction: error checking profile block status:", e);
      // Continue (non-fatal) — but in rare cases you may prefer to block on error.
    }

    // success -> redirect
    redirect("/dashboard");
  } catch (err) {
    console.error("loginAction unexpected error:", err);
    return { error: "Unexpected error during login.", success: false };
  }
}

/**
 * SIGNUP ACTION
 * Forces role = "user" server-side. Returns friendly message if signUp did not create session
 * (e.g. email confirmation required).
 */
export async function signupAction(
  prevState: void | ActionState,
  formData: FormData
): Promise<void | ActionState> {
  try {
    // Defensive: ignore any client attempt to set role
    try {
      formData.delete("makeAdmin");
    } catch {}

    const fullName = getString(formData.get("fullName"));
    const email = getString(formData.get("email"));
    const password = getString(formData.get("password"));

    if (!fullName) return { error: "Full name is required.", success: false };
    if (!email || !isValidEmail(email)) return { error: "Valid email required.", success: false };
    if (!password || password.length < 6) return { error: "Password must be at least 6 characters.", success: false };

    const supabase = await getServerSupabase();

    // sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return { error: signUpError.message || "Unable to create account.", success: false };
    }

    const user = signUpData?.user ?? null;

    // Best-effort: create profile row if user id available; force role "user"
    if (user?.id) {
      try {
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: fullName,
          role: "user", // force user role on signup
          is_blocked: false,
        });
      } catch (e) {
        console.error("signupAction: failed to insert profile:", e);
      }
    }

    // Confirm session (note: signUp may not create a session if email confirmation is required)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("signupAction getSession error:", sessionError);
    }

    if (!sessionData?.session?.user) {
      // No session: likely email confirmation required — show friendly message to client
      return {
        error:
          "Account created. Please verify your email before signing in (check SPAM).",
        success: false,
      };
    }

    // session exists -> redirect
    redirect("/dashboard");
  } catch (err) {
    console.error("signupAction unexpected error:", err);
    return { error: "Unexpected error during signup.", success: false };
  }
}

/* Helpers */
function getString(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}
function isValidEmail(e: string) {
  return /\S+@\S+\.\S+/.test(e);
}
