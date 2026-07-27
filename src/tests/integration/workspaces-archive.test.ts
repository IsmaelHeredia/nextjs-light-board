import { describe, it, expect } from "vitest";

import { GET, POST } from "@/app/api/workspaces/route";
import { PATCH as PATCH_ARCHIVE } from "@/app/api/workspaces/[id]/archive/route";
import { GET as GET_ARCHIVED } from "@/app/api/workspaces/archived/route";

async function createWorkspace(title = "Workspace Test") {
  const res = await POST(
    new Request("http://test/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, image: null }),
    })
  );

  return res.json();
}

describe("Workspaces Archive API", () => {
  it("PATCH debería archivar un workspace", async () => {
    const ws = await createWorkspace();

    const req = new Request(
      `http://test/api/workspaces/${ws.id}/archive`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      }
    );

    const res = await PATCH_ARCHIVE(req, {
      params: Promise.resolve({ id: ws.id }),
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(ws.id);
    expect(data.archived).toBe(true);
    expect(data.archivedAt).toBeDefined();
    expect(data.archivedAt).not.toBeNull();
  });

  it("PATCH debería fallar si 'archived' no es boolean", async () => {
    const ws = await createWorkspace();

    const req = new Request(
      `http://test/api/workspaces/${ws.id}/archive`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: "si" }),
      }
    );

    const res = await PATCH_ARCHIVE(req, {
      params: Promise.resolve({ id: ws.id }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("PATCH debería devolver 404 si el workspace no existe", async () => {
    const req = new Request(
      "http://test/api/workspaces/ws-inexistente/archive",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      }
    );

    const res = await PATCH_ARCHIVE(req, {
      params: Promise.resolve({ id: "ws-inexistente" }),
    });

    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  it("Un workspace archivado no debería aparecer en GET /api/workspaces", async () => {
    const ws1 = await createWorkspace("Activo");
    const ws2 = await createWorkspace("A archivar");

    await PATCH_ARCHIVE(
      new Request(`http://test/api/workspaces/${ws2.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      }),
      { params: Promise.resolve({ id: ws2.id }) }
    );

    const res = await GET();
    const data = await res.json();

    const ids = data.map((w: any) => w.id);

    expect(ids).toContain(ws1.id);
    expect(ids).not.toContain(ws2.id);
  });

  it("GET /api/workspaces/archived debería devolver solo los archivados", async () => {
    const ws1 = await createWorkspace("Activo");
    const ws2 = await createWorkspace("Archivado 1");
    const ws3 = await createWorkspace("Archivado 2");

    await PATCH_ARCHIVE(
      new Request(`http://test/api/workspaces/${ws2.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      }),
      { params: Promise.resolve({ id: ws2.id }) }
    );

    await PATCH_ARCHIVE(
      new Request(`http://test/api/workspaces/${ws3.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      }),
      { params: Promise.resolve({ id: ws3.id }) }
    );

    const res = await GET_ARCHIVED();
    const data = await res.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);

    const ids = data.map((w: any) => w.id);
    expect(ids).toContain(ws2.id);
    expect(ids).toContain(ws3.id);
    expect(ids).not.toContain(ws1.id);

    data.forEach((w: any) => {
      expect(w.archived).toBe(true);
    });
  });

  it("PATCH debería desarchivar un workspace y reasignarle un order válido", async () => {
    const ws = await createWorkspace("Para reabrir");

    await PATCH_ARCHIVE(
      new Request(`http://test/api/workspaces/${ws.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      }),
      { params: Promise.resolve({ id: ws.id }) }
    );

    const reopenReq = new Request(
      `http://test/api/workspaces/${ws.id}/archive`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      }
    );

    const res = await PATCH_ARCHIVE(reopenReq, {
      params: Promise.resolve({ id: ws.id }),
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.archived).toBe(false);
    expect(data.archivedAt).toBeNull();

    const activeRes = await GET();
    const activeData = await activeRes.json();

    const ids = activeData.map((w: any) => w.id);
    expect(ids).toContain(ws.id);
  });

  it("Un workspace reabierto debería volver a aparecer en el orden esperado entre los activos", async () => {
    const wsA = await createWorkspace("A");
    const wsB = await createWorkspace("B");
    const wsC = await createWorkspace("C");

    await PATCH_ARCHIVE(
      new Request(`http://test/api/workspaces/${wsB.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      }),
      { params: Promise.resolve({ id: wsB.id }) }
    );

    let activeRes = await GET();
    let activeData = await activeRes.json();
    expect(activeData.map((w: any) => w.id)).toEqual([wsA.id, wsC.id]);

    await PATCH_ARCHIVE(
      new Request(`http://test/api/workspaces/${wsB.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      }),
      { params: Promise.resolve({ id: wsB.id }) }
    );

    activeRes = await GET();
    activeData = await activeRes.json();

    expect(activeData.map((w: any) => w.id)).toEqual([
      wsA.id,
      wsB.id,
      wsC.id,
    ]);
  });
});