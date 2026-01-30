import { NextResponse } from "next/server";
import { kanbanService } from "@/services/kanban.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;

    const data = await kanbanService.getFullBoard(workspaceId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en API Kanban:", error);
    return NextResponse.json(
      { error: "Error al cargar el tablero" },
      { status: 500 }
    );
  }
}