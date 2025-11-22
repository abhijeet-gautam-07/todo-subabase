"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createTodoAction } from "@/actions/todos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


// union that useActionState expects
type ActionState =
  | { error: string; success?: undefined }
  | { success: boolean; error?: undefined };

// initial state must match one branch
const initialState: ActionState = { error: "" };

export function NewTodoForm() {
  const formRef = useRef<HTMLFormElement>(null);

  // cast action to the expected signature:
  // (prevState?: ActionState, payload: FormData) => Promise<ActionState>
  const [state, formAction] = useActionState(
    createTodoAction as unknown as (
      prevState: ActionState | undefined,
      formData: FormData
    ) => Promise<ActionState>,
    initialState
  );

  useEffect(() => {
    if ("success" in state && state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold">Add todo</h2>
        <p className="text-sm text-muted-foreground">
          Quickly capture something new
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="Plan sprint" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={today}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Details</Label>
        <Textarea id="description" name="description" placeholder="Add context" />
      </div>

      {("error" in state && state.error) && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save todo"}
    </Button>
  );
}
