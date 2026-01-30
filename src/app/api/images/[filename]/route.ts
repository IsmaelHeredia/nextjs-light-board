import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export async function GET(req: Request, context: any) {
  const params = await context.params;
  const { filename } = params;

  const filePath = path.join(
    process.cwd(),
    "uploads",
    "images",
    filename
  );

  try {
    const file = await fs.readFile(filePath);

    const contentType = mime.lookup(filePath);

    if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Archivo no permitido" }, { status: 415 });
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }
}