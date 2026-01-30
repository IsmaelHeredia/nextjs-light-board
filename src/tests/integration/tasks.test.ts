import { describe, it, expect } from "vitest";
import crypto from "crypto";

import {
  POST as POST_TASK,
  PATCH,
  PUT,
  DELETE,
} from "@/app/api/tasks/route";

import { POST as POST_WORKSPACE } from "@/app/api/workspaces/route";

import { db } from "@/db";
import { columns, tags, tasksToTags } from "@/db/schema";

async function createWorkspaceAndColumn() {
  const wsRes = await POST_WORKSPACE(
    new Request("http://test/api/workspaces", {
      method: "POST",
      body: JSON.stringify({
        title: "Workspace Test",
        image: null,
      }),
      headers: { "Content-Type": "application/json" },
    })
  );

  const ws = await wsRes.json();

  const columnId = `column-${crypto.randomUUID()}`;

  await db.insert(columns).values({
    id: columnId,
    workspaceId: ws.id,
    title: "Column Test",
    order: 1,
  });

  return {
    workspaceId: ws.id,
    columnId,
  };
}

describe("Tasks API", () => {
  it("POST debería crear una tarea", async () => {
    const { columnId } = await createWorkspaceAndColumn();

    const req = new Request("http://test/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "Task Test",
        columnId,
        order: 1,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST_TASK(req);
    const data = await res.json();

    expect(data.id).toBeDefined();
    expect(data.title).toBe("Task Test");
    expect(data.columnId).toBe(columnId);
  });

  it("PATCH debería reordenar las tareas", async () => {
    const { columnId } = await createWorkspaceAndColumn();

    const task1 = await (
      await POST_TASK(
        new Request("http://test/api/tasks", {
          method: "POST",
          body: JSON.stringify({
            title: "Task 1",
            columnId,
            order: 1,
          }),
          headers: { "Content-Type": "application/json" },
        })
      )
    ).json();

    const task2 = await (
      await POST_TASK(
        new Request("http://test/api/tasks", {
          method: "POST",
          body: JSON.stringify({
            title: "Task 2",
            columnId,
            order: 2,
          }),
          headers: { "Content-Type": "application/json" },
        })
      )
    ).json();

    const reorderReq = new Request("http://test/api/tasks", {
      method: "PATCH",
      body: JSON.stringify({
        items: [
          { id: task1.id, order: 2 },
          { id: task2.id, order: 1 },
        ],
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PATCH(reorderReq);
    const data = await res.json();

    expect(data.ok).toBe(true);
  });

  it("PUT debería actualizar la tarea y sus etiquetas", async () => {
    const { columnId, workspaceId } = await createWorkspaceAndColumn();

    const task = await (
      await POST_TASK(
        new Request("http://test/api/tasks", {
          method: "POST",
          body: JSON.stringify({
            title: "Original",
            columnId,
            order: 1,
          }),
          headers: { "Content-Type": "application/json" },
        })
      )
    ).json();

    const tagId = `tag-${crypto.randomUUID()}`;

    await db.insert(tags).values({
      id: tagId,
      workspaceId,
      name: "Urgente",
      color: "red",
    });

    const updateReq = new Request("http://test/api/tasks", {
      method: "PUT",
      body: JSON.stringify({
        id: task.id,
        title: "Actualizada",
        description: "Nueva descripción",
        tags: [{ id: tagId }],
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(updateReq);
    const data = await res.json();

    expect(data.ok).toBe(true);

    const relations = await db.select().from(tasksToTags);
    expect(relations.length).toBe(1);
    expect(relations[0].tagId).toBe(tagId);
  });

  it("DELETE debería eliminar la tarea con sus relaciones", async () => {
    const { columnId, workspaceId } = await createWorkspaceAndColumn();

    const task = await (
      await POST_TASK(
        new Request("http://test/api/tasks", {
          method: "POST",
          body: JSON.stringify({
            title: "Task to delete",
            columnId,
            order: 1,
          }),
          headers: { "Content-Type": "application/json" },
        })
      )
    ).json();

    const tagId = `tag-${crypto.randomUUID()}`;

    await db.insert(tags).values({
      id: tagId,
      workspaceId,
      name: "Temp",
      color: "blue",
    });

    await db.insert(tasksToTags).values({
      taskId: task.id,
      tagId,
    });

    const deleteReq = new Request("http://test/api/tasks", {
      method: "DELETE",
      body: JSON.stringify({ id: task.id }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await DELETE(deleteReq);
    const data = await res.json();

    expect(data.ok).toBe(true);

    const relations = await db.select().from(tasksToTags);
    expect(relations.length).toBe(0);
  });
});
