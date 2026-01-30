import { NextResponse } from "next/server";
import { db } from "@/db";
import { columns, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.json();

  const { title, workspaceId, order } = body;

  if (!title || !workspaceId) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .get();

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace not found" },
      { status: 404 }
    );
  }

  const id = `col-${crypto.randomUUID()}`;

  await db.insert(columns).values({
    id,
    title,
    workspaceId,
    order: order ?? 0,
  });

  return NextResponse.json({
    id,
    title,
    workspaceId,
    order: order ?? 0,
  });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, title } = body;

  if (!id || !title) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  await db
    .update(columns)
    .set({ title })
    .where(eq(columns.id, id));

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { items } = body;

  if (!Array.isArray(items)) {
    return NextResponse.json(
      { error: "Items must be an array" },
      { status: 400 }
    );
  }

  for (const item of items) {
    if (!item.id || typeof item.order !== "number") continue;

    await db
      .update(columns)
      .set({ order: item.order })
      .where(eq(columns.id, item.id));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Missing id" },
      { status: 400 }
    );
  }

  await db.delete(columns).where(eq(columns.id, id));

  return NextResponse.json({ ok: true });
}
