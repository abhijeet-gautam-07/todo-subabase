// src/components/todos/edit-todo-dialog.tsx
"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateTodoAction } from "@/actions/todos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditTodoDialogProps = {
  todo: {
    id: string;
    title: string;
    description?: string | null;
    due_date?: string | null;
  };
};

type ActionState = {
  error?: string;
  success?: boolean;
};

export function EditTodoDialog({ todo }: EditTodoDialogProps) {
  // Bind the todo id so the action signature matches what useActionState expects
  // updateTodoAction signature: (todoId: string, prevState?, formData) => Promise<ActionResult>
  const boundAction = React.useMemo(() => updateTodoAction.bind(null, todo.id), [todo.id]);

  const [state, formAction] = useActionState<ActionState, FormData>(
    // pass the bound action — now it has signature (prevState, formData)
    boundAction as unknown as (state: ActionState | undefined, payload: FormData) => ActionState | Promise<ActionState>,
    { error: "", success: false }
  );

  const { pending } = useFormStatus();

  // Local form refs (optional)
  const titleRef = React.useRef<HTMLInputElement | null>(null);
  const descRef = React.useRef<HTMLInputElement | null>(null);
  const dueRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    // helpful for debugging when server returns errors
    console.log("[EditTodoDialog] action state:", state);
  }, [state]);

  return (
    <details className="inline-block">
      <summary className="cursor-pointer underline">Edit</summary>

      <form action={formAction} className="mt-3 space-y-3">
        <div>
          <Label htmlFor={`title-${todo.id}`}>Title</Label>
          <Input
            id={`title-${todo.id}`}
            name="title"
            defaultValue={todo.title}
            ref={titleRef}
            required
          />
        </div>

        <div>
          <Label htmlFor={`description-${todo.id}`}>Description</Label>
          <Input
            id={`description-${todo.id}`}
            name="description"
            defaultValue={todo.description ?? ""}
            ref={descRef}
          />
        </div>

        <div>
          <Label htmlFor={`due-${todo.id}`}>Due date</Label>
          <Input
            id={`due-${todo.id}`}
            name="dueDate"
            type="date"
            defaultValue={todo.due_date ?? ""}
            ref={dueRef}
          />
        </div>

        {state?.error ? <p className="text-sm text-red-600">Error: {state.error}</p> : null}
        {state?.success ? <p className="text-sm text-green-600">Saved</p> : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </details>
  );
}
