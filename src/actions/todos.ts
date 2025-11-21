"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const todoSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
  dueDate: z.string().min(1),
});

const updateSchema = todoSchema.extend({
  id: z.string().uuid(),
});

type ActionState = {
  error?: string;
  success?: boolean;
};

async function getUserId() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  if (!user) {
    throw new Error("Not authenticated");
  }
  return { supabase, user };
}

export async function createTodoAction(
  _prevState: ActionState | undefined,
  formData: FormData,
) {
  const parsed = todoSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return { error: "Please fill all required fields" };
  }
  const { supabase, user } = await getUserId();
  const { error } = await supabase.from("todos").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    due_date: parsed.data.dueDate,
    user_id: user.id,
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTodoAction(
  _prevState: ActionState | undefined,
  formData: FormData,
) {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return { error: "Unable to update todo" };
  }
  const { supabase, user } = await getUserId();
  const { error } = await supabase
    .from("todos")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      due_date: parsed.data.dueDate,
    })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleTodoAction(id: string, completed: boolean) {
  const { supabase, user } = await getUserId();
  const { error } = await supabase
    .from("todos")
    .update({ is_complete: completed })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard");
}

export async function deleteTodoAction(id: string) {
  const { supabase, user } = await getUserId();
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard");
}
