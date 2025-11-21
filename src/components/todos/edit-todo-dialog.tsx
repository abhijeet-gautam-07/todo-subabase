"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateTodoAction } from "@/actions/todos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Todo } from "@/types/todo";


export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// union that useActionState expects
type ActionState =
  | { error: string; success?: undefined }
  | { success: boolean; error?: undefined };

// initial state matches one branch
const initialState: ActionState = { error: "" };

type EditTodoDialogProps = {
  todo: Todo;
};

export function EditTodoDialog({ todo }: EditTodoDialogProps) {
  const [open, setOpen] = useState(false);

  // cast the action to the expected signature so TS lines up:
  // (state?: ActionState, payload: FormData) => Promise<ActionState>
  const [state, formAction] = useActionState(
    updateTodoAction as unknown as (
      prevState: ActionState | undefined,
      formData: FormData
    ) => Promise<ActionState>,
    initialState
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit todo</DialogTitle>
          <DialogDescription>Update details for this task</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" defaultValue={todo.id} />
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={todo.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              required
              defaultValue={
                todo.due_date
                  ? new Date(todo.due_date).toISOString().split("T")[0]
                  : ""
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Details</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={todo.description ?? ""}
            />
          </div>
          {("error" in state && state.error) && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <DialogSubmit />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Updating..." : "Save changes"}
    </Button>
  );
}
