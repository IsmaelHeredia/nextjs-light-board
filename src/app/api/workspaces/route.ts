import { NextResponse } from "next/server";
import { workspacesService } from "@/services/workspaces.service";

export async function GET() {
  const data = await workspacesService.getAll();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { title, image } = await req.json();
  const ws = await workspacesService.create(title, image);
  return NextResponse.json(ws);
}