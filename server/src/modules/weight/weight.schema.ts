import { z } from "zod";

export const weightSchema = z.object({
  id: z.string(),
  weight: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
  supabase_user_id: z.string(),
  date_at: z.number(),
  unit: z.string(),
  profile_id: z.string(),
  isDeleted: z.boolean(),
});

export const weightWatermelonSchema = weightSchema.merge(
  z.object({
    _status: z.string(),
    _changed: z.string(),
  })
);

export type Weight = z.infer<typeof weightSchema>;
