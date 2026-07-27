import { NextResponse } from "next/server";
import { workspacesService } from "@/services/workspaces.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { archived } = await req.json();

    if (typeof archived !== "boolean") {
      return NextResponse.json(
        { error: "El campo 'archived' debe ser boolean" },
        { status: 400 }
      );
    }

    const updated = await workspacesService.setArchived(id, archived);

    if (!updated) {
      return NextResponse.json(
        { error: "Workspace no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al archivar/desarchivar workspace:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}