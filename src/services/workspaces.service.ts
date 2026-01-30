import { db } from "@/db";
import { workspaces, galleryImages } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

import fs from "fs/promises";
import path from "path";

export const workspacesService = {
  async getAll() {
    return db
      .select({
        id: workspaces.id,
        title: workspaces.title,
        createdAt: workspaces.createdAt,
        imageId: workspaces.imageId,
        image: galleryImages.url,
      })
      .from(workspaces)
      .leftJoin(galleryImages, eq(workspaces.imageId, galleryImages.id))
      .orderBy(workspaces.order);
  },

  async getById(id: string) {
    const result = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    return result[0];
  },

  async create(title: string, image?: string) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(workspaces);

    const newWs = {
      id: `ws-${crypto.randomUUID()}`,
      title,
      imageId: null,
      order: count,
      createdAt: new Date(),
    };

    await db.insert(workspaces).values(newWs);
    return newWs;
  },

  async update(id: string, data: { title?: string; imageId?: string | null }) {
    await db
      .update(workspaces)
      .set({
        title: data.title,
        imageId: data.imageId ?? null,
      })
      .where(eq(workspaces.id, id));

    const [updated] = await db
      .select({
        id: workspaces.id,
        title: workspaces.title,
        imageId: workspaces.imageId,
        image: galleryImages.url,
      })
      .from(workspaces)
      .leftJoin(galleryImages, eq(workspaces.imageId, galleryImages.id))
      .where(eq(workspaces.id, id));

    return updated;
  },

  async remove(id: string) {
    return db.delete(workspaces).where(eq(workspaces.id, id));
  },

  async getGallery() {
    const { galleryImages } = await import("@/db/schema");
    return db.select().from(galleryImages);
  },

  async deleteImage(imageId: string) {
    const isUsed = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.imageId, imageId));

    if (isUsed.length > 0) {
      throw new Error("No se puede borrar: La imagen está en uso por un workspace");
    }

    const [imgData] = await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.id, imageId));

    if (!imgData) return;

    const fileName = imgData.url.replace("/api/images/", "");

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "images",
      fileName
    );

    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn("Archivo no encontrado en disco:", filePath);
    }

    return db.delete(galleryImages).where(eq(galleryImages.id, imageId));
  },

  async reorder(items: { id: string; order: number }[]) {
    await db.transaction((tx) => {
      for (const item of items) {
        tx.update(workspaces)
          .set({ order: item.order })
          .where(eq(workspaces.id, item.id))
          .run();
      }
    });
  }

};