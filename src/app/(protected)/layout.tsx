import { AppHeader } from "@/components/shell/app-header";
import { requireUser } from "@/lib/auth";


export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();
  return (
    <div className="min-h-screen bg-muted/40">
      <AppHeader fullName={profile?.full_name} role={profile?.role ?? "user"} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

