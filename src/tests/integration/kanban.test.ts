import { describe, it, expect } from "vitest";
import crypto from "crypto";

import { GET } from "@/app/api/kanban/[workspaceId]/route";
import { POST as POST_WORKSPACE } from "@/app/api/workspaces/route";

import { db } from "@/db";
import { columns, tasks } from "@/db/schema";

async function createFullBoard() {
  const wsRes = await POST_WORKSPACE(
    new Request("http://test/api/workspaces", {
      method: "POST",
      body: JSON.stringify({
        title: "Kanban WS",
        image: null,
      }),
      headers: { "Content-Type": "application/json" },
    })
  );

  const ws = await wsRes.json();

  const col1 = `col-${crypto.randomUUID()}`;
  const col2 = `col-${crypto.randomUUID()}`;

  await db.insert(columns).values([
    { id: col1, title: "Todo", workspaceId: ws.id, order: 1 },
    { id: col2, title: "Doing", workspaceId: ws.id, order: 2 },
  ]);

  await db.insert(tasks).values([
    {
      id: `task-${crypto.randomUUID()}`,
      title: "Task 1",
      columnId: col1,
      order: 1,
      description: "",
    },
    {
      id: `task-${crypto.randomUUID()}`,
      title: "Task 2",
      columnId: col2,
      order: 1,
      description: "",
    },
  ]);

  return ws.id;
}

describe("Kanban API", () => {
  it("GET debería devolver el tablero completo", async () => {
    const workspaceId = await createFullBoard();

    const res = await GET(
      new Request("http://test/api/kanban"),
      {
        params: Promise.resolve({ workspaceId }),
      }
    );

    const data = await res.json();

    expect(data).toBeDefined();
    expect(Array.isArray(data.columns)).toBe(true);
    expect(data.columns.length).toBe(2);

    expect(data.columns[0].id).toBeDefined();
    expect(data.columns[0].title).toBeDefined();
  });
});
