import { z } from "zod";

export const weightSchema = z.object({
  id: z.string(),
  weight: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  supabaseId: z.string(),
  date: z.string(),
  unit: z.string(),
  profileId: z.string(),
});
