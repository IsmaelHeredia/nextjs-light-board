import { beforeAll, beforeEach } from "vitest";
import { db } from "@/db";

beforeAll(async () => {
  await db.run(`PRAGMA foreign_keys = ON;`);

  await db.run(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image_id TEXT,
      "order" INTEGER NOT NULL,
      created_at INTEGER,
      FOREIGN KEY (image_id)
        REFERENCES gallery_images(id)
        ON DELETE SET NULL
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS columns (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      title TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE CASCADE
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      column_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      "order" INTEGER NOT NULL,
      FOREIGN KEY (column_id)
        REFERENCES columns(id)
        ON DELETE CASCADE
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE CASCADE
    );
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS tasks_to_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id)
        REFERENCES tasks(id)
        ON DELETE CASCADE,
      FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
    );
  `);
});

beforeEach(async () => {
  await db.run(`DELETE FROM tasks_to_tags;`);
  await db.run(`DELETE FROM tasks;`);
  await db.run(`DELETE FROM columns;`);
  await db.run(`DELETE FROM tags;`);
  await db.run(`DELETE FROM workspaces;`);
  await db.run(`DELETE FROM gallery_images;`);
});
