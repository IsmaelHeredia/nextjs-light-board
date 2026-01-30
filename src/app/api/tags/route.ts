import { NextResponse } from "next/server";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { name, color, workspaceId } = await req.json();

    if (!name || !color || !workspaceId) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const newTag = {
      id: `tag-${crypto.randomUUID()}`,
      name,
      color,
      workspaceId,
    };

    await db.insert(tags).values(newTag);

    return NextResponse.json(newTag);
  } catch (error) {
    console.error("Error creando tag:", error);
    return NextResponse.json(
      { error: "Error al crear etiqueta" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, color } = await req.json();
    if (!id || !name || !color) {
      return NextResponse.json({ error: "Campos incompletos" }, { status: 400 });
    }

    await db.update(tags).set({ name, color }).where(eq(tags.id, id));

    return NextResponse.json({ id, name, color });
  } catch (error) {
    console.error("Error editando tag:", error);
    return NextResponse.json({ error: "Error al actualizar etiqueta" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID de etiqueta requerido" },
        { status: 400 }
      );
    }

    await db.delete(tags).where(eq(tags.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error borrando tag:", error);
    return NextResponse.json(
      { error: "Error al borrar etiqueta" },
      { status: 500 }
    );
  }
}
