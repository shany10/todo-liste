import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";

export type SqliteDb = Database.Database;

const DB_PATH = join(process.cwd(), ".data", "todos.sqlite");

declare global {
  var __SQLITE_DB__: SqliteDb | undefined;
}

function init(db: SqliteDb) {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      user_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      birthdate TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Safe migrations for pre-existing databases
  try { db.exec("ALTER TABLE todos ADD COLUMN content TEXT NOT NULL DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE todos ADD COLUMN user_id TEXT"); } catch {}
}

export function getDb(): SqliteDb {
  if (globalThis.__SQLITE_DB__) return globalThis.__SQLITE_DB__;

  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  init(db);

  globalThis.__SQLITE_DB__ = db;
  return db;
}
