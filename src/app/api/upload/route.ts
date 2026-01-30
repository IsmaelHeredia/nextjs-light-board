import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { db } from "@/db";
import { galleryImages } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const ext = path.extname(file.name).toLowerCase();
    const fileName = `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;

    const uploadDir = path.join(process.cwd(), "uploads", "images");
    const filePath = path.join(uploadDir, fileName);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const imageId = uuidv4();
    const imageUrl = `/api/images/${fileName}`;

    await db.insert(galleryImages).values({
      id: imageId,
      url: imageUrl,
    });

    return NextResponse.json({
      id: imageId,
      url: imageUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}