import { describe, it, expect } from "vitest";
import crypto from "crypto";

import { POST as POST_WORKSPACE } from "@/app/api/workspaces/route";
import { PUT as PUT_TAG, POST as POST_TAG, DELETE as DELETE_TAG } from "@/app/api/tags/route";

async function createWorkspace() {
  const res = await POST_WORKSPACE(
    new Request("http://test/api/workspaces", {
      method: "POST",
      body: JSON.stringify({
        title: "Workspace Tags",
        image: null,
      }),
      headers: { "Content-Type": "application/json" },
    })
  );

  return res.json();
}

describe("Tags API", () => {
  it("POST debería crear una etiqueta", async () => {
    const workspace = await createWorkspace();

    const req = new Request("http://test/api/tags", {
      method: "POST",
      body: JSON.stringify({
        name: "Urgente",
        color: "red",
        workspaceId: workspace.id,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST_TAG(req);
    const data = await res.json();

    expect(data.id).toBeDefined();
    expect(data.id.startsWith("tag-")).toBe(true);
    expect(data.name).toBe("Urgente");
    expect(data.color).toBe("red");
    expect(data.workspaceId).toBe(workspace.id);
  });

  it("POST debería fallar si falta el parametro workspaceId", async () => {
    const req = new Request("http://test/api/tags", {
      method: "POST",
      body: JSON.stringify({
        name: "Sin workspace",
        color: "blue",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST_TAG(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});

it("PUT debería actualizar una etiqueta existente", async () => {
  const workspace = await createWorkspace();

  const createReq = new Request("http://test/api/tags", {
    method: "POST",
    body: JSON.stringify({
      name: "Original",
      color: "red",
      workspaceId: workspace.id,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const createRes = await POST_TAG(createReq);
  const tag = await createRes.json();

  const updatedReq = new Request("http://test/api/tags", {
    method: "PUT",
    body: JSON.stringify({
      id: tag.id,
      name: "Actualizada",
      color: "blue",
    }),
    headers: { "Content-Type": "application/json" },
  });

  const updatedRes = await PUT_TAG(updatedReq);
  const updatedTag = await updatedRes.json();

  expect(updatedRes.status).toBe(200);
  expect(updatedTag.id).toBe(tag.id);
  expect(updatedTag.name).toBe("Actualizada");
  expect(updatedTag.color).toBe("blue");
});

it("PUT debería fallar si los campos no estan completos", async () => {
  const req = new Request("http://test/api/tags", {
    method: "PUT",
    body: JSON.stringify({ id: "tag-123" }),
    headers: { "Content-Type": "application/json" },
  });

  const res = await PUT_TAG(req);
  const data = await res.json();

  expect(res.status).toBe(400);
  expect(data.error).toBeDefined();
});

it("DELETE debería borrar una etiqueta existente", async () => {
  const workspace = await createWorkspace();

  const createReq = new Request("http://test/api/tags", {
    method: "POST",
    body: JSON.stringify({
      name: "Temporal",
      color: "green",
      workspaceId: workspace.id,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const createRes = await POST_TAG(createReq);
  const tag = await createRes.json();

  const deleteReq = new Request("http://test/api/tags", {
    method: "DELETE",
    body: JSON.stringify({ id: tag.id }),
    headers: { "Content-Type": "application/json" },
  });

  const deleteRes = await DELETE_TAG(deleteReq);
  const deleteData = await deleteRes.json();

  expect(deleteRes.status).toBe(200);
  expect(deleteData.success).toBe(true);
});

it("DELETE debería fallar si no se envía el id", async () => {
  const req = new Request("http://test/api/tags", {
    method: "DELETE",
    body: JSON.stringify({}),
    headers: { "Content-Type": "application/json" },
  });

  const res = await DELETE_TAG(req);
  const data = await res.json();

  expect(res.status).toBe(400);
  expect(data.error).toBeDefined();
});