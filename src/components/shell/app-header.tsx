import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/logout-button";

type AppHeaderProps = {
  fullName?: string | null;
  role?: "user" | "admin";
};

export function AppHeader({ fullName, role }: AppHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <Link href="/dashboard" className="text-lg font-semibold">
            Supabase Todos
          </Link>
          {fullName && (
            <p className="text-sm text-muted-foreground">Hi {fullName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Admin
            </Link>
          )}
          <Badge variant="secondary">{role === "admin" ? "Admin" : "Member"}</Badge>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

