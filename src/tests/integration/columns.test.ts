import { describe, it, expect } from "vitest";

import {
  POST,
  PUT,
  PATCH,
  DELETE,
} from "@/app/api/columns/route";

import { POST as POST_WORKSPACE } from "@/app/api/workspaces/route";

async function createWorkspace() {
  const res = await POST_WORKSPACE(
    new Request("http://test/api/workspaces", {
      method: "POST",
      body: JSON.stringify({
        title: "Workspace Test",
        image: null,
      }),
      headers: { "Content-Type": "application/json" },
    })
  );

  return res.json();
}

async function createColumn(workspaceId: string, title = "Columna Test", order = 1) {
  const res = await POST(
    new Request("http://test/api/columns", {
      method: "POST",
      body: JSON.stringify({
        title,
        workspaceId,
        order,
      }),
      headers: { "Content-Type": "application/json" },
    })
  );

  return res.json();
}

describe("Columns API", () => {
  it("POST debería crear una columna", async () => {
    const ws = await createWorkspace();

    const data = await createColumn(ws.id);

    expect(data.id).toBeDefined();
    expect(data.title).toBe("Columna Test");
    expect(data.workspaceId).toBe(ws.id);
  });

  it("PUT debería actualizar el título de una columna", async () => {
    const ws = await createWorkspace();
    const column = await createColumn(ws.id, "Viejo título");

    const req = new Request("http://test/api/columns", {
      method: "PUT",
      body: JSON.stringify({
        id: column.id,
        title: "Nuevo título",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(data.ok).toBe(true);
  });

  it("PATCH debería reordenar las columnas", async () => {
    const ws = await createWorkspace();

    const col1 = await createColumn(ws.id, "Col 1", 1);
    const col2 = await createColumn(ws.id, "Col 2", 2);

    const req = new Request("http://test/api/columns", {
      method: "PATCH",
      body: JSON.stringify({
        items: [
          { id: col1.id, order: 2 },
          { id: col2.id, order: 1 },
        ],
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await PATCH(req);
    const data = await res.json();

    expect(data.ok).toBe(true);
  });

  it("DELETE debería eliminar una columna", async () => {
    const ws = await createWorkspace();
    const column = await createColumn(ws.id, "A borrar");

    const req = new Request("http://test/api/columns", {
      method: "DELETE",
      body: JSON.stringify({ id: column.id }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(data.ok).toBe(true);
  });
});
