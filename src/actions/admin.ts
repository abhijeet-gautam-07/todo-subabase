// src/actions/admin.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";

const userSchema = z.object({
  userId: z.string().uuid(),
});

const todoIdSchema = z.object({
  todoId: z.string().uuid(),
});

async function validateUser(formData: FormData) {
  const parsed = userSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) {
    throw new Error("Invalid user id");
  }
  return parsed.data.userId;
}

async function validateTodoId(formData: FormData) {
  const parsed = todoIdSchema.safeParse({ todoId: formData.get("todoId") });
  if (!parsed.success) {
    throw new Error("Invalid todo id");
  }
  return parsed.data.todoId;
}

export async function blockUser(formData: FormData) {
  await requireAdmin();
  const userId = await validateUser(formData);
  const admin = getAdminSupabase();
  await admin.from("profiles").update({ is_blocked: true }).eq("id", userId);
  revalidatePath("/admin");
}

export async function unblockUser(formData: FormData) {
  await requireAdmin();
  const userId = await validateUser(formData);
  const admin = getAdminSupabase();
  await admin.from("profiles").update({ is_blocked: false }).eq("id", userId);
  revalidatePath("/admin");
}

export async function promoteUser(formData: FormData) {
  await requireAdmin();
  const userId = await validateUser(formData);
  const admin = getAdminSupabase();
  await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
  revalidatePath("/admin");
}

export async function demoteUser(formData: FormData) {
  await requireAdmin();
  const userId = await validateUser(formData);
  const admin = getAdminSupabase();
  await admin.from("profiles").update({ role: "user" }).eq("id", userId);
  revalidatePath("/admin");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const userId = await validateUser(formData);
  const admin = getAdminSupabase();
  // remove user todos and profile then delete auth user
  await admin.from("todos").delete().eq("user_id", userId);
  await admin.from("profiles").delete().eq("id", userId);
  await admin.auth.admin.deleteUser(userId);
  revalidatePath("/admin");
}

export async function deleteTodo(formData: FormData) {
  await requireAdmin();
  const todoId = await validateTodoId(formData);
  const admin = getAdminSupabase();
  await admin.from("todos").delete().eq("id", todoId);
  revalidatePath("/admin");
}
