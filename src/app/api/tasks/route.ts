import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, tasksToTags } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  const { title, columnId, order } = await req.json();

  const newTask = {
    id: `task-${crypto.randomUUID()}`,
    columnId,
    title,
    order,
    description: "",
  };

  await db.insert(tasks).values(newTask);

  return NextResponse.json(newTask);
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (body.items && Array.isArray(body.items)) {
      const { columnId, items } = body;

      await Promise.all(
        items.map((item: any) =>
          db.update(tasks)
            .set({ order: item.order, columnId })
            .where(eq(tasks.id, item.id))
        )
      );
      return NextResponse.json({ ok: true });
    }

    const { id, columnId, order } = body;
    await db.update(tasks)
      .set({ columnId, order })
      .where(eq(tasks.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en PATCH tasks:", error);
    return NextResponse.json({ error: "Error al mover tarea" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, description, tags } = await req.json();

    await db.update(tasks)
      .set({ title, description })
      .where(eq(tasks.id, id));

    await db.delete(tasksToTags)
      .where(eq(tasksToTags.taskId, id));

    if (Array.isArray(tags) && tags.length > 0) {
      await db.insert(tasksToTags).values(
        tags.map((tag: any) => ({
          taskId: id,
          tagId: tag.id
        }))
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar tarea" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await db.delete(tasksToTags)
      .where(eq(tasksToTags.taskId, id));

    await db.delete(tasks)
      .where(eq(tasks.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar tarea" },
      { status: 500 }
    );
  }
}