"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

/**
 * ActionResult guarantees `success: boolean`. We accept `prevState: any`
 * to be compatible with whatever shape the client-side `ActionState` uses.
 */
export type ActionResult = { error?: string; success: boolean };

/* -------------------------------------------------------------------------- */
/*                                CREATE TODO                                 */
/* -------------------------------------------------------------------------- */

export async function createTodoAction(
  // widened prevState type to match useActionState's incoming shape
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  try {
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const dueDate = formData.get("dueDate")?.toString() || null;

    if (!title) return { error: "Title is required", success: false };

    const auth = await requireUser();
    if (!auth.user) {
      console.error("createTodoAction: not authenticated");
      return { error: "Not authenticated", success: false };
    }
    const user = auth.user;

    const supabase = await getServerSupabase();

    const res: any = await supabase.from("todos").insert({
      title,
      description,
      due_date: dueDate,
      user_id: user.id,
      is_complete: false,
    });

    if (res.error) {
      console.error("createTodoAction error:", res.error);
      return { error: "Failed to create todo", success: false };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("createTodoAction unexpected error:", err);
    return { error: "Unexpected error", success: false };
  }
}

/* -------------------------------------------------------------------------- */
/*                                UPDATE TODO                                 */
/* -------------------------------------------------------------------------- */

export async function updateTodoAction(
  // first param is todoId (bound in client) — second param is prevState from useActionState
  todoId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  try {
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || null;
    const dueDate = formData.get("dueDate")?.toString() || null;

    if (!title) return { error: "Title is required", success: false };

    const auth = await requireUser();
    if (!auth.user) {
      console.error("updateTodoAction: not authenticated");
      return { error: "Not authenticated", success: false };
    }
    const user = auth.user;
    const profile = auth.profile;

    const supabase = await getServerSupabase();

    const res: any = await supabase
      .from("todos")
      .update({ title, description, due_date: dueDate })
      .eq("id", todoId)
      .eq("user_id", user.id);

    const noRows =
      !res.data || (Array.isArray(res.data) && res.data.length === 0);

    if (noRows && profile?.role === "admin") {
      try {
        const { getAdminSupabase } = await import("@/lib/supabase/admin");
        const admin = getAdminSupabase();
        await admin
          .from("todos")
          .update({ title, description, due_date: dueDate })
          .eq("id", todoId);
      } catch (e) {
        console.error("updateTodoAction admin fallback failed:", e);
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("updateTodoAction error:", err);
    return { error: "Unexpected error", success: false };
  }
}

/* -------------------------------------------------------------------------- */
/*                             TOGGLE TODO COMPLETE                            */
/* -------------------------------------------------------------------------- */

export async function toggleTodoAction(
  todoId: string,
  completed: boolean,
  formData: FormData
): Promise<void> {
  try {
    const auth = await requireUser();
    if (!auth.user) {
      console.error("toggleTodoAction: not authenticated");
      return;
    }
    const user = auth.user;
    const profile = auth.profile;

    const supabase = await getServerSupabase();

    const res: any = await supabase
      .from("todos")
      .update({ is_complete: completed })
      .eq("id", todoId)
      .eq("user_id", user.id);

    const noRows =
      !res.data || (Array.isArray(res.data) && res.data.length === 0);

    if (noRows && profile?.role === "admin") {
      try {
        const { getAdminSupabase } = await import("@/lib/supabase/admin");
        const admin = getAdminSupabase();
        await admin.from("todos").update({ is_complete: completed }).eq("id", todoId);
      } catch (e) {
        console.error("toggleTodoAction admin fallback failed:", e);
      }
    }

    revalidatePath("/dashboard");
  } catch (err) {
    console.error("toggleTodoAction unexpected error:", err);
  }
}

/* -------------------------------------------------------------------------- */
/*                                 DELETE TODO                                 */
/* -------------------------------------------------------------------------- */

export async function deleteTodoAction(
  todoId: string,
  formData: FormData
): Promise<void> {
  try {
    const auth = await requireUser();
    if (!auth.user) {
      console.error("deleteTodoAction: not authenticated");
      return;
    }
    const user = auth.user;
    const profile = auth.profile;

    const supabase = await getServerSupabase();

    const res: any = await supabase
      .from("todos")
      .delete()
      .eq("id", todoId)
      .eq("user_id", user.id);

    const noRows =
      !res.data || (Array.isArray(res.data) && res.data.length === 0);

    if (noRows && profile?.role === "admin") {
      try {
        const { getAdminSupabase } = await import("@/lib/supabase/admin");
        const admin = getAdminSupabase();
        await admin.from("todos").delete().eq("id", todoId);
      } catch (e) {
        console.error("deleteTodoAction admin fallback failed:", e);
      }
    }

    revalidatePath("/dashboard");
  } catch (err) {
    console.error("deleteTodoAction unexpected error:", err);
  }
}
