"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type ActionState = {
  error?: string;
};

// --------------------
// LOGIN ACTION
// --------------------
export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const form = parseAuthForm(formData);

  if ("error" in form) {
    return { error: form.error };
  }

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

// --------------------
// SIGNUP ACTION
// --------------------
export async function signupAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const form = parseSignupForm(formData);

  if ("error" in form) {
    return { error: form.error };
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        full_name: form.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.user) {
    await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        full_name: form.fullName,
        role: form.makeAdmin ? "admin" : "user",
      })
      .single();
  }

  redirect("/dashboard");
}

// --------------------
// LOGOUT ACTION
// --------------------
export async function logoutAction(): Promise<void> {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

// --------------------
// FORM UTILITIES
// --------------------

const MIN_PASSWORD_LENGTH = 6;

type AuthSuccess = { email: string; password: string };
type ErrorResult = { error: string };
type AuthResult = AuthSuccess | ErrorResult;
type SignupSuccess = AuthSuccess & { fullName: string; makeAdmin: boolean };
type SignupResult = SignupSuccess | ErrorResult;

function parseAuthForm(formData: FormData): AuthResult {
  const email = normalizeEmail(formData.get("email"));
  const password = getPassword(formData.get("password"));

  if (!email) return { error: "Email is required" };
  if (!isValidEmail(email)) return { error: "Email address is invalid" };
  if (!password) return { error: "Password is required" };
  if (password.length < MIN_PASSWORD_LENGTH)
    return { error: "Password is too short" };

  return { email, password };
}

function parseSignupForm(formData: FormData): SignupResult {
  const auth = parseAuthForm(formData);
  if ("error" in auth) return auth;

  const fullName = normalizeText(formData.get("fullName"));
  if (!fullName) return { error: "Full name is required" };
  if (fullName.length > 120)
    return { error: "Full name is too long" };

  const makeAdmin = getCheckboxValue(formData.get("makeAdmin"));

  return { email: auth.email, password: auth.password, fullName, makeAdmin };
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getPassword(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function getCheckboxValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return false;
  }
  return value === "on" || value === "true";
}
