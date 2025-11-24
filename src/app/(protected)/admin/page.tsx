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

export default async function AdminPage() {
  noStore();

  // BUILD-TIME GUARD: ensure envs present
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!envUrl || !envServiceKey) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">
          Admin panel unavailable during build. Please set Supabase environment variables for Preview/Production.
        </p>
      </div>
    );
  }

  const { user } = await requireAdmin(); // guard, ensures current user is admin
  const admin = getAdminSupabase();

  // load profiles
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // load auth users to get emails (optional)
  const { data: authUsers } = await admin.auth.admin.listUsers?.();

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

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Admin</h1>
        <p className="text-muted-foreground">
          Manage users across the workspace
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
                      <form action={unblockUser}>
                        <input type="hidden" name="userId" value={row.id} />
                        <Button type="submit" disabled={row.id === user?.id}>Unblock</Button>
                      </form>
                    ) : (
                      <form action={blockUser}>
                        <input type="hidden" name="userId" value={row.id} />
                        <Button type="submit" disabled={row.id === user?.id}>Block</Button>
                      </form>
                    )}

                    {row.role === "admin" ? (
                      <form action={demoteUser}>
                        <input type="hidden" name="userId" value={row.id} />
                        <Button type="submit" disabled={row.id === user?.id}>Remove admin</Button>
                      </form>
                    ) : (
                      <form action={promoteUser}>
                        <input type="hidden" name="userId" value={row.id} />
                        <Button type="submit" disabled={row.id === user?.id}>Make admin</Button>
                      </form>
                    )}

                    <form action={deleteUser}>
                      <input type="hidden" name="userId" value={row.id} />
                      <Button type="submit" disabled={row.id === user?.id}>Delete</Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note: Admins can manage user profiles here. They cannot view or delete other users' todos. */}
    </div>
  );
}
