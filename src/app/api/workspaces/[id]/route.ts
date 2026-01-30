import { NextResponse } from "next/server";
import { workspacesService } from "@/services/workspaces.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const { id } = await params;

  const updated = await workspacesService.update(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await workspacesService.remove(id);
  return NextResponse.json({ success: true });
}