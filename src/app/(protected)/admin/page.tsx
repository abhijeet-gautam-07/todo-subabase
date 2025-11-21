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
export const fetchCache = "force-no-store";

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
  const { session } = await requireAdmin();
  const admin = getAdminSupabase();
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: authUsers } = await admin.auth.admin.listUsers();

  const rows: AdminUserRow[] = (profiles ?? []).map((profile) => {
    const match = authUsers?.users?.find((user) => user.id === profile.id);
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
          Manage every user across the workspace
        </p>
      </div>
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
                        disabled={row.id === session?.user.id}
                      />
                    ) : (
                      <ActionButton
                        formAction={blockUser}
                        userId={row.id}
                        label="Block"
                        variant="secondary"
                        disabled={row.id === session?.user.id}
                      />
                    )}
                    {row.role === "admin" ? (
                      <ActionButton
                        formAction={demoteUser}
                        userId={row.id}
                        label="Remove admin"
                        disabled={row.id === session?.user.id}
                      />
                    ) : (
                      <ActionButton
                        formAction={promoteUser}
                        userId={row.id}
                        label="Make admin"
                        disabled={row.id === session?.user.id}
                      />
                    )}
                    <ActionButton
                      formAction={deleteUser}
                      userId={row.id}
                      label="Delete"
                      variant="destructive"
                      disabled={row.id === session?.user.id}
                    />
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

