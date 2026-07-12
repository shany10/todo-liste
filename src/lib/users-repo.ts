import { createHash, randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import type { User, UserInput } from "@/lib/user";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

type UserRow = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  birthdate: string;
  password_hash: string;
  created_at: string;
};

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    firstname: row.firstname,
    lastname: row.lastname,
    email: row.email,
    birthdate: row.birthdate,
    passwordHash: row.password_hash,
  };
}

export function createUser(input: UserInput): User {
  const db = getDb();

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(input.email.trim().toLowerCase());

  if (existing) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const user: UserRow = {
    id: randomUUID(),
    firstname: input.firstname.trim(),
    lastname: input.lastname.trim(),
    email: input.email.trim().toLowerCase(),
    birthdate: input.birthdate,
    password_hash: hashPassword(input.password),
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO users (id, firstname, lastname, email, birthdate, password_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    user.id,
    user.firstname,
    user.lastname,
    user.email,
    user.birthdate,
    user.password_hash,
    user.created_at
  );

  return rowToUser(user);
}

export function getUserByEmail(email: string): User | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.trim().toLowerCase()) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}
