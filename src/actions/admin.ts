// src/actions/admin.ts
"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * Admin actions: manage user profiles only.
 * NOTE: This file intentionally does NOT include any actions to delete or modify todos.
 * Admins will NOT be able to view/delete other users' todos from the admin UI.
 */

/** Delete a user (profile + try to delete auth user) */
export async function deleteUser(formData: FormData): Promise<void> {
  const userId = formData.get("userId") as string | null;
  if (!userId) {
    console.error("deleteUser: missing userId");
    return;
  }

  const admin = getAdminSupabase();

  try {
    // delete profile row
    await admin.from("profiles").delete().eq("id", userId);

    // try to delete auth user via admin API (SDK shape varies)
    try {
      // @ts-ignore tolerant call
      if (admin.auth && (admin.auth.admin || admin.auth.api)) {
        if (typeof (admin.auth as any).admin?.deleteUser === "function") {
          await (admin.auth as any).admin.deleteUser(userId);
        } else if (typeof (admin.auth as any).deleteUser === "function") {
          await (admin.auth as any).deleteUser(userId);
        }
      }
    } catch (e) {
      console.error("deleteUser: error deleting auth user (non-fatal):", e);
    }

    // revalidate admin/dashboard pages
    try {
      revalidatePath("/dashboard");
      revalidatePath("/admin");
    } catch {}
  } catch (err) {
    console.error("deleteUser error:", err);
  }
}

/** Block a user (set is_blocked = true) */
export async function blockUser(formData: FormData): Promise<void> {
  const userId = formData.get("userId") as string | null;
  if (!userId) {
    console.error("blockUser: missing userId");
    return;
  }

  const admin = getAdminSupabase();
  try {
    await admin.from("profiles").update({ is_blocked: true }).eq("id", userId);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("blockUser error:", err);
  }
}

/** Unblock a user (set is_blocked = false) */
export async function unblockUser(formData: FormData): Promise<void> {
  const userId = formData.get("userId") as string | null;
  if (!userId) {
    console.error("unblockUser: missing userId");
    return;
  }

  const admin = getAdminSupabase();
  try {
    await admin.from("profiles").update({ is_blocked: false }).eq("id", userId);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("unblockUser error:", err);
  }
}

/** Promote user to admin (role = "admin") */
export async function promoteUser(formData: FormData): Promise<void> {
  const userId = formData.get("userId") as string | null;
  if (!userId) {
    console.error("promoteUser: missing userId");
    return;
  }

  const admin = getAdminSupabase();
  try {
    await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("promoteUser error:", err);
  }
}

/** Demote admin to regular user (role = "user") */
export async function demoteUser(formData: FormData): Promise<void> {
  const userId = formData.get("userId") as string | null;
  if (!userId) {
    console.error("demoteUser: missing userId");
    return;
  }

  const admin = getAdminSupabase();
  try {
    await admin.from("profiles").update({ role: "user" }).eq("id", userId);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("demoteUser error:", err);
  }
}
