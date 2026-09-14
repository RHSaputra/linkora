import { z } from "zod";
import { DEFAULT_CATEGORIES } from "./utils";

export const createLinkSchema = z.object({
  url: z.string().url("URL tidak valid"),
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  category: z.enum(DEFAULT_CATEGORIES as unknown as [string, ...string[]]),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  favicon: z.string().optional(),
  thumbnail: z.string().optional(),
  isFavorite: z.boolean().default(false),
  reminderAt: z.string().datetime().optional().nullable(),
});

export const updateLinkSchema = createLinkSchema.partial().extend({
  id: z.string(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Nama koleksi wajib diisi"),
  description: z.string().optional(),
  color: z.string().default("#6366f1"),
  icon: z.string().default("folder"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export const createRoadmapSchema = z.object({
  title: z.string().min(1, "Judul roadmap wajib diisi").max(100, "Judul terlalu panjang (maksimal 100 karakter)"),
  description: z.string().max(500, "Deskripsi terlalu panjang (maksimal 500 karakter)").optional(),
});

export const updateRoadmapSchema = createRoadmapSchema.partial();

export const createRoadmapNodeSchema = z.object({
  type: z.enum(["LINK", "TASK", "NOTE"]),
  title: z.string().min(1, "Judul node wajib diisi").max(120, "Judul terlalu panjang"),
  description: z.string().max(1000, "Konten/deskripsi terlalu panjang").optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
  linkId: z.string().optional().nullable(),
});

export const updateRoadmapNodeSchema = createRoadmapNodeSchema.partial();

export const batchUpdateNodePositionsSchema = z.object({
  positions: z.array(
    z.object({
      id: z.string(),
      positionX: z.number(),
      positionY: z.number(),
    })
  ),
});

export const createRoadmapEdgeSchema = z.object({
  sourceNodeId: z.string().min(1, "Source node required"),
  targetNodeId: z.string().min(1, "Target node required"),
  label: z.string().max(50).optional().nullable(),
});

export type CreateRoadmapInput = z.infer<typeof createRoadmapSchema>;
export type UpdateRoadmapInput = z.infer<typeof updateRoadmapSchema>;
export type CreateRoadmapNodeInput = z.infer<typeof createRoadmapNodeSchema>;
export type UpdateRoadmapNodeInput = z.infer<typeof updateRoadmapNodeSchema>;
export type CreateRoadmapEdgeInput = z.infer<typeof createRoadmapEdgeSchema>;
