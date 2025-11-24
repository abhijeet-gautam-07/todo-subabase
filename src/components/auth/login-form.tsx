"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

const initialState = { error: "" };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    console.log("[LoginForm] action state:", state);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <p className="text-sm text-red-600">Error: {state.error}</p> : null}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required placeholder="Your password" />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="remember" />
          <span className="text-sm">Remember me</span>
        </label>
        <Link href="/signup" className="text-sm underline">Sign up</Link>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Please wait..." : "Sign in"}
      </Button>
    </form>
  );
}
