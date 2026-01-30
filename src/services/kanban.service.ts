import { db } from "@/db";
import { workspaces, columns, tasks, tags, tasksToTags } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";

export const kanbanService = {

  async getFullBoard(workspaceId: string) {

    const boardColumns = await db
      .select()
      .from(columns)
      .where(eq(columns.workspaceId, workspaceId))
      .orderBy(asc(columns.order));

    if (boardColumns.length === 0) {
      return { columns: [], tasks: [], tags: [] };
    }

    const columnIds = boardColumns.map(col => col.id);

    const boardTasks = await db
      .select()
      .from(tasks)
      .where(inArray(tasks.columnId, columnIds))
      .orderBy(asc(tasks.order));

    const taskIds = boardTasks.map(task => task.id);

    const relations = taskIds.length
      ? await db
        .select({
          taskId: tasksToTags.taskId,
          tagId: tags.id,
          name: tags.name,
          color: tags.color
        })
        .from(tasksToTags)
        .innerJoin(tags, eq(tags.id, tasksToTags.tagId))
        .where(inArray(tasksToTags.taskId, taskIds))
      : [];

    const tasksWithTags = boardTasks.map(task => ({
      ...task,
      tags: relations
        .filter(rel => rel.taskId === task.id)
        .map(rel => ({
          id: rel.tagId,
          name: rel.name,
          color: rel.color
        }))
    }));

    const boardTags = await db
      .select()
      .from(tags)
      .where(eq(tags.workspaceId, workspaceId));

    return {
      columns: boardColumns,
      tasks: tasksWithTags,
      tags: boardTags
    };
  },

  async syncColumnsOrder(orderedColumns: any[]) {
    for (const col of orderedColumns) {
      await db
        .update(columns)
        .set({ order: col.order })
        .where(eq(columns.id, col.id));
    }
  },

  async createTask(data: any) {
    await db.insert(tasks).values({
      id: data.id,
      columnId: data.columnId,
      title: data.title,
      order: data.order,
      description: ""
    });
  }
};