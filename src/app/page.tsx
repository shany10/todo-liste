"use client";

import { useEffect, useState } from "react";
import { TodoList } from "./composant/todoList";
import { FormTodoList } from "./composant/formTodoList";

type Todo = {
  id: string;
  name: string;
  createdAt: string;
};

export default function Home() {
  const [lists, setLists] = useState<Todo[]>([]);

  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then(({ todos }) => {
        setLists(todos);
      })
      .catch(() => {
        setLists([]);
      });
  }, []);

  const handleSubmit = (name: string) => {
    fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then(({ todo }) => {
        setLists((prev) => [todo, ...prev]);
      })
      .catch(() => {
        // noop
      });
  };

  const handleDelete = (id: string) => {
    fetch("/api/todos", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then(() => {
        setLists((prev) => prev.filter((todo) => todo.id !== id));
      })
      .catch(() => {
        // noop
      });
  };

  return (
    <div className="min-h-dvh w-full bg-foreground/5 text-foreground flex items-center justify-center p-6">
      <main className="w-full max-w-xl rounded-2xl border border-foreground/10 bg-background p-6 sm:p-8">
        <FormTodoList handleSubmit={handleSubmit} />
        <br />
        <TodoList lists={lists} handleDelete={handleDelete} />
      </main>
    </div>
  );
}
