import { NextResponse } from "next/server";
import { workspacesService } from "@/services/workspaces.service";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await workspacesService.reorder(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en el reorder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}