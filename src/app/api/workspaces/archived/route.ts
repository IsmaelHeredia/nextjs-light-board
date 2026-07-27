import { NextResponse } from "next/server";
import { workspacesService } from "@/services/workspaces.service";

export async function GET() {
  try {
    const data = await workspacesService.getArchived();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener workspaces archivados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}