// src/components/auth/signup-form.tsx
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ActionState = { error?: string; success?: boolean };
const initialState: ActionState = { error: "" };

export function SignupForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(signupAction as any, initialState);
  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required placeholder="Ada Lovelace" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Account created</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Please wait..." : "Create account"}
      </Button>

      <p className="text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
