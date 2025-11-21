"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

export async function loginAction(
  _prevState: ActionState | undefined,
  formData: FormData,
) {
  const form = parseAuthForm(formData);
  if (form.error) {
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
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function signupAction(
  _prevState: ActionState | undefined,
  formData: FormData,
) {
  const form = parseSignupForm(formData);
  if (form.error) {
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
  if (data.user) {
    await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        full_name: form.fullName,
        role: "user",
      })
      .select()
      .single();
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

const MIN_PASSWORD_LENGTH = 6;

function parseAuthForm(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = getPassword(formData.get("password"));
  if (!email) {
    return { error: "Email is required" };
  }
  if (!isValidEmail(email)) {
    return { error: "Email address is invalid" };
  }
  if (!password) {
    return { error: "Password is required" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: "Password is too short" };
  }
  return { email, password };
}

function parseSignupForm(formData: FormData) {
  const auth = parseAuthForm(formData);
  if ("error" in auth) {
    return auth;
  }
  const fullName = normalizeText(formData.get("fullName"));
  if (!fullName) {
    return { error: "Full name is required" };
  }
  if (fullName.length > 120) {
    return { error: "Full name is too long" };
  }
  return { ...auth, fullName };
}

function normalizeEmail(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
}

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function getPassword(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }
  return value;
}

function isValidEmail(email: string) {
  if (!email) {
    return false;
  }
  const parts = email.split("@");
  if (parts.length !== 2) {
    return false;
  }
  const [local, domain] = parts;
  if (!local || !domain) {
    return false;
  }
  if (domain.startsWith(".") || domain.endsWith(".")) {
    return false;
  }
  if (domain.split(".").length < 2) {
    return false;
  }
  const localPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  const domainPattern = /^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  return localPattern.test(local) && domainPattern.test(domain);
}

