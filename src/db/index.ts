import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";

const isTest = process.env.NODE_ENV === "test";

const dataDir = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, isTest ? "test.db" : "database.sqlite");
const sqlite = new Database(dbPath);

sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite);
