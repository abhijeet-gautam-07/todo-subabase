import { format } from "date-fns";
import { toggleTodoAction, deleteTodoAction } from "@/actions/todos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditTodoDialog } from "@/components/todos/edit-todo-dialog";
import { Todo } from "@/types/todo";

type TodoListProps = {
  todos: Todo[];
};

export function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card/40 p-8 text-center text-sm text-muted-foreground">
        Nothing here yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <Card key={todo.id}>
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold">{todo.title}</h3>
                {todo.is_complete ? (
                  <Badge variant="secondary">Done</Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
              {todo.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {todo.description}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Due {todo.due_date ? format(new Date(todo.due_date), "PP") : "TBD"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <form
                action={toggleTodoAction.bind(null, todo.id, !todo.is_complete)}
              >
                <Button
                  type="submit"
                  variant={todo.is_complete ? "secondary" : "outline"}
                  size="sm"
                >
                  {todo.is_complete ? "Mark pending" : "Mark done"}
                </Button>
              </form>
              <EditTodoDialog todo={todo} />
              <form action={deleteTodoAction.bind(null, todo.id)}>
                <Button type="submit" variant="destructive" size="sm">
                  Delete
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

