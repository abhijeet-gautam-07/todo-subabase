// src/app/(protected)/admin/page.tsx
import { unstable_noStore as noStore } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import {
  blockUser,
  unblockUser,
  promoteUser,
  demoteUser,
  deleteUser,
  deleteTodo as adminDeleteTodo,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type AdminUserRow = {
  id: string;
  full_name: string | null;
  role: "user" | "admin";
  is_blocked: boolean;
  email: string;
  created_at: string | null;
};

type AdminTodoRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string | null;
  user_id: string;
  user_name: string | null;
};

export default async function AdminPage() {
  noStore();
  const { user } = await requireAdmin();
  const admin = getAdminSupabase();

  // load profiles
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // load auth users to get emails (optional)
  const { data: authUsers } = await admin.auth.admin.listUsers();

  // load all todos with user info
  const { data: todos } = await admin
    .from("todos")
    .select("id, title, description, due_date, created_at, user_id")
    .order("created_at", { ascending: false });

  const rows: AdminUserRow[] = (profiles ?? []).map((profile: any) => {
    const match = authUsers?.users?.find((u: any) => u.id === profile.id);
    return {
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
      is_blocked: profile.is_blocked,
      email: match?.email ?? "",
      created_at: match?.created_at ?? null,
    };
  });

  const todoRows: AdminTodoRow[] = (todos ?? []).map((t: any) => {
    const profile = (profiles ?? []).find((p: any) => p.id === t.user_id);
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      due_date: t.due_date ?? null,
      created_at: t.created_at ?? null,
      user_id: t.user_id,
      user_name: profile?.full_name ?? profile?.id ?? "Unknown",
    };
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">
          Manage every user and their todos across the workspace
        </p>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-4">
                  <div className="font-medium">{row.full_name ?? "Unknown"}</div>
                  <p className="text-xs text-muted-foreground">{row.id}</p>
                </td>
                <td className="px-4 py-4">{row.email}</td>
                <td className="px-4 py-4 capitalize">{row.role}</td>
                <td className="px-4 py-4">
                  {row.is_blocked ? (
                    <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive">
                      Blocked
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {row.is_blocked ? (
                      <ActionButton
                        formAction={unblockUser}
                        userId={row.id}
                        label="Unblock"
                        disabled={row.id === user.id}
                      />
                    ) : (
                      <ActionButton
                        formAction={blockUser}
                        userId={row.id}
                        label="Block"
                        variant="secondary"
                        disabled={row.id === user.id}
                      />
                    )}
                    {row.role === "admin" ? (
                      <ActionButton
                        formAction={demoteUser}
                        userId={row.id}
                        label="Remove admin"
                        disabled={row.id === user.id}
                      />
                    ) : (
                      <ActionButton
                        formAction={promoteUser}
                        userId={row.id}
                        label="Make admin"
                        disabled={row.id === user.id}
                      />
                    )}
                    <ActionButton
                      formAction={deleteUser}
                      userId={row.id}
                      label="Delete"
                      variant="destructive"
                      disabled={row.id === user.id}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TODOS TABLE */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">All Todos</h2>
        <p className="text-muted-foreground">List of every todo created by users</p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {todoRows.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-4 py-4">{t.title}</td>
                <td className="px-4 py-4">{t.user_name}</td>
                <td className="px-4 py-4">{t.due_date ?? "—"}</td>
                <td className="px-4 py-4">{t.created_at ?? "—"}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <form action={adminDeleteTodo}>
                      <input type="hidden" name="todoId" value={t.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type ActionButtonProps = {
  formAction: (formData: FormData) => Promise<void>;
  userId: string;
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  disabled?: boolean;
};

function ActionButton({
  formAction,
  userId,
  label,
  variant = "outline",
  disabled,
}: ActionButtonProps) {
  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <Button type="submit" variant={variant} size="sm" disabled={disabled}>
        {label}
      </Button>
    </form>
  );
}
