import { unstable_noStore as noStore } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { NewTodoForm } from "@/components/todos/new-todo-form";
import { TodoTabs } from "@/components/todos/todo-tabs";
import { Todo } from "@/types/todo";



export default async function DashboardPage() {
  noStore();
  const { user } = await requireUser();
  const userId = user?.id;
  if (!userId) {
    throw new Error("Missing user");
  }
  const supabase = await getServerSupabase();
  const { data: todos = [] } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track today&apos;s focus, pending work, and what you have already finished.
        </p>
      </section>
      <NewTodoForm />
      <TodoTabs todos={todos as Todo[]} />
    </div>
  );
}

