import { describe, it, expect } from "vitest";

import { GET, POST } from "@/app/api/workspaces/route";
import { PUT, DELETE } from "@/app/api/workspaces/[id]/route";
import { PATCH } from "@/app/api/workspaces/reorder/route";

describe("Workspaces API", () => {
  it("GET debería devolver un array", async () => {
    const res = await GET();
    const data = await res.json();

    expect(Array.isArray(data)).toBe(true);
  });

  it("POST debería crear un workspace", async () => {
    const req = new Request("http://test/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Workspace Test",
        image: null,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.id).toBeDefined();
    expect(data.title).toBe("Workspace Test");
  });

  it("PUT debería actualizar un workspace", async () => {
    const createReq = new Request("http://test/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Old title",
        image: null,
      }),
    });

    const ws = await (await POST(createReq)).json();

    const updateReq = new Request(
      `http://test/api/workspaces/${ws.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New title",
        }),
      }
    );

    const res = await PUT(updateReq, {
      params: Promise.resolve({ id: ws.id }),
    });

    expect(res.status).toBe(200);
  });

  it("PATCH debería actualizar el orden", async () => {
    const ws1 = await (
      await POST(
        new Request("http://test/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "WS 1", image: null }),
        })
      )
    ).json();

    const ws2 = await (
      await POST(
        new Request("http://test/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "WS 2", image: null }),
        })
      )
    ).json();

    const reorderReq = new Request(
      "http://test/api/workspaces/reorder",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          { id: ws1.id, order: 2 },
          { id: ws2.id, order: 1 },
        ]),
      }
    );

    const res = await PATCH(reorderReq);
    const data = await res.json();

    expect(data.success).toBe(true);
  });

  it("DELETE debería eliminar un workspace", async () => {
    const ws = await (
      await POST(
        new Request("http://test/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "To delete",
            image: null,
          }),
        })
      )
    ).json();

    const deleteReq = new Request(
      `http://test/api/workspaces/${ws.id}`,
      { method: "DELETE" }
    );

    const res = await DELETE(deleteReq, {
      params: Promise.resolve({ id: ws.id }),
    });

    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
