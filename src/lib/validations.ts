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
