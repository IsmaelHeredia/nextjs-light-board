import { NextResponse } from "next/server";
import { workspacesService } from "@/services/workspaces.service";

export async function GET() {
  try {
    const images = await workspacesService.getGallery();
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar la galería" }, { status: 500 });
  }
}