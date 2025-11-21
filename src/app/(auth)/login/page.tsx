import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your todos"
    >
      <LoginForm />
    </AuthCard>
  );
}

