/**
 * The backend's SQLite database, shared by the services that keep local state.
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../database");

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
}

// Tests use ":memory:"
const db = new Database(
  process.env.SESSIONS_DB_PATH || path.join(dbPath, "sessions.db")
);

export default db;
