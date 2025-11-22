"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";



const userSchema = z.object({
  userId: z.string().uuid(),
});

async function validate(formData: FormData) {
  const parsed = userSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) {
    throw new Error("Invalid user");
  }
  return parsed.data.userId;
}

export async function blockUser(formData: FormData) {
  await requireAdmin();
  const userId = await validate(formData);
  const admin = getAdminSupabase();
  await admin.from("profiles").update({ is_blocked: true }).eq("id", userId);
  revalidatePath("/admin");
}

export async function unblockUser(formData: FormData) {
  await requireAdmin();
  const userId = await validate(formData);
  const admin = getAdminSupabase();
  await admin.from("profiles").update({ is_blocked: false }).eq("id", userId);
  revalidatePath("/admin");
}

export async function promoteUser(formData: FormData) {
  await requireAdmin();
  const userId = await validate(formData);
  const admin = getAdminSupabase();
  await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
  revalidatePath("/admin");
}

export async function demoteUser(formData: FormData) {
  await requireAdmin();
  const userId = await validate(formData);
  const admin = getAdminSupabase();
  await admin.from("profiles").update({ role: "user" }).eq("id", userId);
  revalidatePath("/admin");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const userId = await validate(formData);
  const admin = getAdminSupabase();
  await admin.from("todos").delete().eq("user_id", userId);
  await admin.from("profiles").delete().eq("id", userId);
  await admin.auth.admin.deleteUser(userId);
  revalidatePath("/admin");
}

