import { z } from "zod";

export const weightSchema = z.object({
  id: z.string(),
  weight: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  supabaseId: z.string(),
  date: z.coerce.date(),
  unit: z.string(),
  profileId: z.string(),
  dateString: z.string(),
});

export const weightWatermelonSchema = z.object({
  _status: z.string(),
  _changed: z.string(),
  id: z.string(),
  weight: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  supabase_id: z.string(),
  date: z.coerce.date(),
  unit: z.string(),
  profile_id: z.string(),
  date_string: z.string(),
});
