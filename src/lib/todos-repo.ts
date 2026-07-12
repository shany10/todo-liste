import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";

export type Item = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

type UserRow = { id: string };
type CountRow = { count: number };

// ── Error class ──────────────────────────────────────────────────────────────

export class TodoError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "TodoError";
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function assertUserValid(userId: string): void {
  const db = getDb();
  const user = db
    .prepare("SELECT id FROM users WHERE id = ?")
    .get(userId) as UserRow | undefined;
  if (!user) {
    throw new TodoError("INVALID_USER", "Utilisateur invalide.");
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Returns all items of a user's TodoList, newest first. */
export function listItems(userId: string): Item[] {
  assertUserValid(userId);
  const db = getDb();
  return db
    .prepare(
      "SELECT id, name, content, created_at as createdAt FROM todos WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(userId) as Item[];
}

/**
 * Adds an item to the user's TodoList.
 *
 * Business rules enforced:
 *  1. The user must exist (valid).
 *  2. The list must have fewer than 10 items.
 *  3. The item name must be unique within the list.
 *  4. The content must be at most 1000 characters.
 *  5. At least 30 minutes must have passed since the last item was added.
 */
export function addItem(userId: string, name: string, content: string): Item {
  // Rule 1 — user must be valid
  assertUserValid(userId);

  const db = getDb();
  const trimmedName = name.trim();
  const trimmedContent = content.trim();

  if (!trimmedName) {
    throw new TodoError("NAME_REQUIRED", "Le nom est requis.");
  }

  // Rule 4 — content max 1000 chars
  if (trimmedContent.length > 1000) {
    throw new TodoError(
      "CONTENT_TOO_LONG",
      "Le contenu ne peut pas dépasser 1000 caractères.",
    );
  }

  // Rule 2 — max 10 items
  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM todos WHERE user_id = ?")
    .get(userId) as CountRow;
  if (count >= 10) {
    throw new TodoError(
      "LIST_FULL",
      "La liste ne peut pas contenir plus de 10 items.",
    );
  }

  // Rule 3 — unique name within the list
  const duplicate = db
    .prepare("SELECT id FROM todos WHERE user_id = ? AND name = ?")
    .get(userId, trimmedName);
  if (duplicate) {
    throw new TodoError(
      "NAME_DUPLICATE",
      "Un item avec ce nom existe déjà dans la liste.",
    );
  }

  // Rule 5 — 30-minute cooldown between additions (skipped when DISABLE_COOLDOWN=true)
  if (!process.env.DISABLE_COOLDOWN) {
    const lastRow = db
      .prepare(
        "SELECT created_at FROM todos WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      )
      .get(userId) as { created_at: string } | undefined;

    if (lastRow) {
      const elapsedMs = Date.now() - new Date(lastRow.created_at).getTime();
      const elapsedMin = elapsedMs / 1000 / 60;
      if (elapsedMin < 30) {
        const waitMin = Math.ceil(30 - elapsedMin);
        throw new TodoError(
          "COOLDOWN",
          `Vous devez attendre encore ${waitMin} minute(s) avant d'ajouter un nouvel item.`,
        );
      }
    }
  }

  const item: Item = {
    id: randomUUID(),
    name: trimmedName,
    content: trimmedContent,
    createdAt: new Date().toISOString(),
  };

  db.prepare(
    "INSERT INTO todos (id, name, content, user_id, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(item.id, item.name, item.content, userId, item.createdAt);

  return item;
}

/** Deletes an item, ensuring it belongs to the given user. */
export function deleteItem(id: string, userId: string): boolean {
  const db = getDb();
  const info = db
    .prepare("DELETE FROM todos WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return info.changes > 0;
}

