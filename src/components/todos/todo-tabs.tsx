"use client";

import { useMemo } from "react";
import { isSameDay } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodoList } from "@/components/todos/todo-list";
import { Todo } from "@/types/todo";

type TodoTabsProps = {
  todos: Todo[];
};

export function TodoTabs({ todos }: TodoTabsProps) {
  const grouped = useMemo(() => {
    const today = new Date();
    const todays = todos.filter(
      (todo) => todo.due_date && isSameDay(new Date(todo.due_date), today),
    );
    const completed = todos.filter((todo) => todo.is_complete);
    const pending = todos.filter((todo) => !todo.is_complete);
    return { todays, completed, pending };
  }, [todos]);

  return (
    <Tabs defaultValue="today" className="space-y-6">
      <TabsList>
        <TabsTrigger value="today">
          Today ({grouped.todays.length})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending ({grouped.pending.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({grouped.completed.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="today">
        <TodoList todos={grouped.todays} />
      </TabsContent>
      <TabsContent value="pending">
        <TodoList todos={grouped.pending} />
      </TabsContent>
      <TabsContent value="completed">
        <TodoList todos={grouped.completed} />
      </TabsContent>
    </Tabs>
  );
}

