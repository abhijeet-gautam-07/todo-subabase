import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function SignupPage() {
  const {user} = await getUser();
  if (user) {
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

