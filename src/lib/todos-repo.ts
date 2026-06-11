import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";

export type Todo = {
  id: string;
  name: string;
  createdAt: string;
};

function ensureSeeded(): void {
  const db = getDb();
  const hasAny = db.prepare("SELECT 1 FROM todos LIMIT 1").get();
  if (hasAny) return;

  const insert = db.prepare(
    "INSERT INTO todos (id, name, created_at) VALUES (?, ?, ?)",
  );

  const defaults = ["Task 1", "Task 2", "Task 3"];
  const base = Date.now();

  db.transaction(() => {
    for (let i = 0; i < defaults.length; i += 1) {
      insert.run(
        randomUUID(),
        defaults[i],
        new Date(base - i * 1000).toISOString(),
      );
    }
  })();
}

export function listTodos(): Todo[] {
  ensureSeeded();
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, name, created_at as createdAt FROM todos ORDER BY created_at DESC",
    )
    .all() as Todo[];
  return rows;
}

export function getTodoById(id: string): Todo | null {
  ensureSeeded();
  const db = getDb();
  const row = db
    .prepare("SELECT id, name, created_at as createdAt FROM todos WHERE id = ?")
    .get(id) as Todo | undefined;
  return row ?? null;
}

export function createTodo(name: string): Todo {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("NAME_REQUIRED");
  }

  const todo: Todo = {
    id: randomUUID(),
    name: trimmed,
    createdAt: new Date().toISOString(),
  };

  const db = getDb();
  db.prepare("INSERT INTO todos (id, name, created_at) VALUES (?, ?, ?)").run(
    todo.id,
    todo.name,
    todo.createdAt,
  );

  return todo;
}

export function deleteTodo(id: string): boolean {
  const db = getDb();
  const info = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  return info.changes > 0;
}
