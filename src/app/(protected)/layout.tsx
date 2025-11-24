import { AppHeader } from "@/components/shell/app-header";
import { requireUser } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  // Normalize the role so it matches AppHeaderProps exactly
  const safeRole: "user" | "admin" =
    profile?.role === "admin" ? "admin" : "user";

  return (
    <div className="min-h-screen bg-muted/40">
      <AppHeader fullName={profile?.full_name} role={safeRole} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
