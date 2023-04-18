import { z } from "zod";

export const weightSchema = z.object({
  id: z.string(),
  weight: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  supabaseId: z.string(),
  date: z.date(),
  unit: z.string(),
  profileId: z.string(),
  dateString: z.string(),
});

export const weightWatermelonSchema = z.object({
  _status: z.string(),
  _changed: z.string(),
  id: z.string(),
  weight: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
  supabase_id: z.string(),
  date: z.date(),
  unit: z.string(),
  profile_id: z.string(),
  date_string: z.string(),
});
