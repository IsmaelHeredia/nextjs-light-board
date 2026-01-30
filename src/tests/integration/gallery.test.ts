import { describe, it, expect } from "vitest";
import crypto from "crypto";

import { GET as GET_GALLERY } from "@/app/api/gallery/route";
import { DELETE as DELETE_GALLERY } from "@/app/api/gallery/[id]/route";
import { POST as POST_UPLOAD } from "@/app/api/upload/route";

import { db } from "@/db";
import { galleryImages } from "@/db/schema";

function createFakeImageFile() {
  const content = Buffer.from("fake-image-content");

  return new File([content], "test.png", {
    type: "image/png",
  });
}

describe("Gallery API", () => {
  it("GET debería devolver un array vacío inicialmente", async () => {
    const res = await GET_GALLERY();
    const data = await res.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  it("POST debería subir una imagen y guardarla en la DB", async () => {
    const file = createFakeImageFile();

    const formData = new FormData();
    formData.append("file", file);

    const req = new Request("http://test/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST_UPLOAD(req);
    const data = await res.json();

    expect(data.id).toBeDefined();
    expect(data.url).toContain("/api/images/");

    const images = await db.select().from(galleryImages);
    expect(images.length).toBe(1);
    expect(images[0].id).toBe(data.id);
  });

  it("GET debería devolver las imágenes subidas", async () => {
    const id = crypto.randomUUID();

    await db.insert(galleryImages).values({
      id,
      url: "/api/images/test.png",
    });

    const res = await GET_GALLERY();
    const data = await res.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].id).toBe(id);
  });

  it("DELETE debería eliminar una imagen", async () => {
    const id = crypto.randomUUID();

    await db.insert(galleryImages).values({
      id,
      url: "/api/images/delete.png",
    });

    const deleteReq = new Request("http://test/api/gallery/" + id, {
      method: "DELETE",
    });

    const res = await DELETE_GALLERY(deleteReq, {
      params: Promise.resolve({ id }),
    });

    const data = await res.json();
    expect(data.success).toBe(true);

    const images = await db.select().from(galleryImages);
    expect(images.length).toBe(0);
  });
});
