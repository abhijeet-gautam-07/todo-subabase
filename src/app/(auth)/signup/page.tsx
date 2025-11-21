import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <AuthCard
      title="Create account"
      subtitle="Get started with Supabase Todos"
    >
      <SignupForm />
    </AuthCard>
  );
}

