import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const galleryImages = sqliteTable("gallery_images", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
});

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  imageId: text("image_id").references(() => galleryImages.id, { onDelete: "set null" }),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

export const columns = sqliteTable("columns", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  columnId: text("column_id").notNull().references(() => columns.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").default(""),
  order: integer("order").notNull(),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const tasksToTags = sqliteTable("tasks_to_tags", {
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});